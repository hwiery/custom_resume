import { supabase } from '../config/supabase';

export const uploadResumeFile = async (
    file: File,
    userId: string,
    fileType: 'pdf' | 'docx'
) => {
    try {
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET_NAME as string)
            .upload(fileName, file);

        if (error) throw error;

        // 파일의 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
            .from(process.env.SUPABASE_BUCKET_NAME as string)
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('File upload failed:', error);
        throw error;
    }
};

export const deleteResumeFile = async (fileUrl: string) => {
    try {
        const fileName = fileUrl.split('/').pop();
        if (!fileName) throw new Error('Invalid file URL');

        const { error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET_NAME as string)
            .remove([fileName]);

        if (error) throw error;
    } catch (error) {
        console.error('File deletion failed:', error);
        throw error;
    }
}; 
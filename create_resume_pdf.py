from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from pathlib import Path
# from reportlab.pdfbase import pdfmetrics # 제거
# from reportlab.pdfbase.ttfonts import TTFont # 제거

# 대상 MD 파일 목록 (수정됨)
md_files = [
    "생성결과/생성_라이언로켓_중구.md",
    "생성결과/생성_RIPPLEAI_강남.md",
    "생성결과/생성_AITRICS_강남.md",
    "생성결과/생성_한국딥러닝_서초구.md",
    "생성결과/생성_하이퍼커넥트.md",
    "생성결과/생성_포지큐브_강남.md",
    "생성결과/생성_콕스웨이브_영등포.md",
    "생성결과/생성_인라이플_구로구.md",
    "생성결과/생성_이스트소프트_서초구.md",
    "생성결과/생성_머니투데이_종로.md",
    "생성결과/생성_메사쿠어컴퍼니_강남구.md",
    "생성결과/생성_메이아이_강남구.md",
    "생성결과/생성_버즈니_관악.md",
    "생성결과/생성_베슬AI_서초구.md",
    "생성결과/생성_aipm셀렉트스타_역삼_.md",
    "생성결과/생성_셀렉트스타_역삼역.md",
    "생성결과/생성_모아데이타_성남 pm.md",
]

output_dir = "출력"
Path(output_dir).mkdir(parents=True, exist_ok=True)

# 한글 폰트 등록 제거
# pdfmetrics.registerFont(TTFont('NanumGothic', 'NanumGothic.ttf')) # 제거

def create_pdf_from_md(md_filepath, output_dir):
    """MD 파일을 읽어 PDF 문서로 생성합니다."""
    with open(md_filepath, "r", encoding="utf-8") as f:
        md_content = f.read()

    filename = Path(md_filepath).stem
    parts = filename.split("_")
    company_name = parts[1] if len(parts) >= 2 else "Unknown"
    output_filename = f"이력서_양호영_{company_name}.pdf"
    output_path = Path(output_dir) / output_filename
    
    # Convert WindowsPath to string
    output_path_str = str(output_path)

    doc = SimpleDocTemplate(output_path_str, pagesize=letter)
    styles = getSampleStyleSheet()
    Story = []

    title_style = styles["h1"]
    subtitle_style = styles["h2"]
    normal_style = styles["Normal"]
    bullet_style = styles["Bullet"]

    # 한글 폰트 적용 제거 및 Arial 적용
    title_style.fontName = 'Arial'
    subtitle_style.fontName = 'Arial'
    normal_style.fontName = 'Arial'
    bullet_style.fontName = 'Arial'

    Story.append(Paragraph(f"이력서_양호영_{company_name}", title_style))
    Story.append(Spacer(1, 0.2*inch))

    for line in md_content.splitlines():
        if line.startswith("## "):
            Story.append(Paragraph(line[3:], subtitle_style))
            Story.append(Spacer(1, 0.1*inch))
        elif line.startswith("* "):
            Story.append(Paragraph(line[2:], bullet_style))
        elif line.startswith("***"):
            Story.append(Spacer(1, 0.1*inch))
        elif line.strip():
            Story.append(Paragraph(line, normal_style))
            Story.append(Spacer(1, 0.1*inch))

    doc.build(Story)
    print(f"📄 {output_path} 생성 완료")

# MD 파일 목록을 순회하며 PDF 파일 생성
for md_file in md_files:
    create_pdf_from_md(md_file, output_dir)

print("✅ 모든 이력서 생성 완료!") 
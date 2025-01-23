from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pathlib import Path
import os
import re

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
    "생성결과/생성_지원동기_포지큐브_강남pm.md",
]

output_dir = "출력"
Path(output_dir).mkdir(parents=True, exist_ok=True)

# Malgun Gothic 폰트 등록
pdfmetrics.registerFont(TTFont('MalgunGothic', 'C:/Windows/Fonts/malgun.ttf'))  # 경로를 시스템에 맞게 조정

def create_pdf_from_md_styled(md_filepath, output_dir):
    """MD 파일을 읽어 스타일이 적용된 PDF 문서로 생성합니다."""
    with open(md_filepath, "r", encoding="utf-8") as f:
        md_content = f.read()

    filename = Path(md_filepath).stem
    parts = filename.split("_")
    company_name = parts[1] if len(parts) >= 2 else "Unknown"
    output_filename = f"이력서_양호영_{company_name}_styled.pdf"
    output_path = Path(output_dir) / output_filename
    
    # Convert WindowsPath to string
    output_path_str = str(output_path)

    doc = SimpleDocTemplate(output_path_str, pagesize=letter)
    styles = getSampleStyleSheet()
    Story = []

    # 색상 정의
    primary_color = colors.HexColor("#336699")
    secondary_color = colors.grey

    # 기본 폰트 설정
    font_name = "MalgunGothic"  # Malgun Gothic 폰트로 변경

    # 스타일 가져오기 및 폰트 설정
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["h1"],
        fontName=font_name,
        fontSize=48,
        alignment=0,  # 좌 정렬로 변경
        textColor=primary_color,
        spaceAfter=12,
    )
    
    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["h2"],
        fontName=font_name,
        textColor=primary_color,
        spaceBefore=6,
        spaceAfter=3,
        alignment=0,  # 좌 정렬로 변경
    )
    
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["Normal"],
        fontName=font_name,
        spaceAfter=3,
        alignment=0,  # 좌 정렬로 변경
    )
    
    bullet_style = ParagraphStyle(
        "BulletStyle",
        parent=styles["Normal"],
        fontName=font_name,
        leftIndent=20,
        bulletColor=primary_color,
        spaceAfter=2,
        alignment=0,  # 좌 정렬로 변경
    )

    # 상단에 이름 출력
    Story.append(Paragraph(f"양호영", title_style))
    Story.append(Spacer(1, 0.2*inch))  # 줄 간격 추가

    for line in md_content.splitlines():
        # **로 강조된 텍스트 처리
        line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)  # **로 감싸진 텍스트를 <b>로 감싸기
        if line.startswith("## "):
            Story.append(Paragraph(line[3:], subtitle_style))
        elif line.startswith("* "):
            Story.append(Paragraph(line[2:], bullet_style))
        elif line.startswith("***"):
            Story.append(Spacer(1, 0.1*inch))
        elif line.strip():
            Story.append(Paragraph(line, body_style))
        Story.append(Spacer(1, 0.05*inch))

    # 핵심 역량, 경력 상세, 학력 스타일 수정
    for section in ["핵심 역량", "경력 상세", "학력"]:
        Story.append(Paragraph(section, ParagraphStyle(
            name='SectionStyle',
            fontName=font_name,
            fontSize=14,  # 20% 증가
            textColor=primary_color,
            spaceAfter=6,
            alignment=0,  # 좌 정렬
            bold=True  # 볼드 추가
        )))
        Story.append(Spacer(1, 0.2*inch))  # 빈 공간 추가

    # 회사명 줄에 볼드 추가
    for line in md_content.splitlines():
        if "브릭메이트" in line or "업보트 엔터" in line:
            Story.append(Paragraph(line, ParagraphStyle(
                name='CompanyStyle',
                fontName=font_name,
                fontSize=13,  # 10% 증가
                textColor=primary_color,
                spaceAfter=3,
                alignment=0,  # 좌 정렬
                bold=True  # 볼드 추가
            )))
            Story.append(Spacer(1, 0.2*inch))  # 빈 공간 추가
        else:
            Story.append(Paragraph(line, body_style))

    doc.build(Story)
    print(f"📄 {output_path} 생성 완료")

# MD 파일 목록을 순회하며 PDF 파일 생성
for md_file in md_files:
    create_pdf_from_md_styled(md_file, output_dir)

print("✅ 모든 이력서 생성 완료!") 
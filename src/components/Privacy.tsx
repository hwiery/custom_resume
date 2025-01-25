import React from 'react';
import styled from 'styled-components';

const Privacy: React.FC = () => {
    return (
        <Container>
            <Content>
                <Title>개인정보 처리방침</Title>
                <LastModified>최종 수정일: 2024년 1월 25일</LastModified>

                <Section>
                    <SectionTitle>1. 수집하는 정보</SectionTitle>
                    <Text>
                        회사는 다음과 같은 최소한의 정보만을 수집합니다:

                        사용자 제공 정보
                        - Google 로그인을 통한 기본 프로필 정보 (이름, 이메일)
                        - 이력서 작성에 필요한 정보

                        자동 수집 정보
                        - 서비스 이용 기록
                        - 세션 관리를 위한 쿠키
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>2. 정보 사용 목적</SectionTitle>
                    <Text>
                        회사는 수집된 정보를 다음과 같은 목적으로만 사용합니다:
                        
                        - 이력서 작성 서비스 제공
                        - 작성된 이력서의 저장 및 관리
                        - 사용자 인증 및 계정 관리
                        - docx, pdf 형식의 이력서 다운로드 제공
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>3. 정보 보호</SectionTitle>
                    <Text>
                        - 회사는 사용자의 개인정보를 안전하게 보호하기 위해 보안 시스템을 갖추고 있습니다.
                        - 수집된 정보는 이력서 작성 및 관리 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
                        - 사용자의 동의 없이는 어떠한 개인정보도 외부에 공개되지 않습니다.
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>4. 정보 보유 기간</SectionTitle>
                    <Text>
                        - 회원 탈퇴 시 즉시 모든 개인정보가 삭제됩니다.
                        - 단, 법령에 따라 보존이 필요한 경우 관련 법령에서 정한 기간 동안 보관됩니다.
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>5. 사용자 권리</SectionTitle>
                    <Text>
                        사용자는 다음과 같은 권리를 가집니다:
                        
                        - 개인정보 열람 요청
                        - 개인정보 수정 요청
                        - 개인정보 삭제 요청
                        - 개인정보 처리 정지 요청
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>6. 정책 변경</SectionTitle>
                    <Text>
                        본 개인정보 처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있습니다.
                        변경사항이 있는 경우 웹사이트를 통해 공지하겠습니다.
                    </Text>
                </Section>
            </Content>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 20px;
    max-width: 800px;
    margin: 0 auto;
    background: white;
`;

const Content = styled.div`
    font-family: 'Pretendard Regular', sans-serif;
`;

const Title = styled.h1`
    font-size: 32px;
    color: #1E3A8A;
    margin-bottom: 8px;
    font-family: 'Pretendard Bold', sans-serif;
`;

const LastModified = styled.p`
    color: #6B7280;
    margin-bottom: 40px;
`;

const Section = styled.section`
    margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    color: #1F2937;
    margin-bottom: 16px;
    font-family: 'Pretendard Bold', sans-serif;
`;

const Text = styled.p`
    font-size: 16px;
    line-height: 1.6;
    color: #4B5563;
    white-space: pre-line;
`;

export default Privacy; 
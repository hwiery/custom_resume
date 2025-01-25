import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    max-width: 760px;
    margin: 0 auto;
    padding: 150px 20px 40px;
`;

const Title = styled.h1`
    font-size: 24px;
    margin-bottom: 20px;
    color: #343a40;
`;

const Section = styled.section`
    margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    margin-bottom: 15px;
    color: #495057;
`;

const Content = styled.p`
    font-size: 16px;
    line-height: 1.6;
    color: #6c757d;
    margin-bottom: 15px;
`;

const Privacy: React.FC = () => {
    return (
        <Container>
            <Title>개인정보처리방침</Title>
            
            <Section>
                <SectionTitle>1. 개인정보 수집 항목</SectionTitle>
                <Content>
                    Resumer는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
                    - 필수항목: 이메일 주소, 이름
                    - 선택항목: 프로필 사진, 경력사항, 학력사항
                </Content>
            </Section>

            <Section>
                <SectionTitle>2. 개인정보의 수집 및 이용목적</SectionTitle>
                <Content>
                    수집된 개인정보는 다음의 목적으로만 이용됩니다:
                    - 서비스 제공 및 운영
                    - 회원 관리 및 본인 확인
                    - 이력서 작성 및 관리 서비스 제공
                </Content>
            </Section>

            <Section>
                <SectionTitle>3. 개인정보의 보유 및 이용기간</SectionTitle>
                <Content>
                    회원 탈퇴 시 즉시 파기하는 것을 원칙으로 합니다.
                    단, 관련 법령에 의해 보존할 필요가 있는 경우 법령에서 정한 기간 동안 보관됩니다.
                </Content>
            </Section>

            <Section>
                <SectionTitle>4. 개인정보의 파기절차</SectionTitle>
                <Content>
                    개인정보는 목적이 달성된 후 내부 방침 및 관련 법령에 따라 안전하게 파기됩니다.
                    전자적 파일 형태로 저장된 개인정보는 복구할 수 없는 방법으로 영구 삭제됩니다.
                </Content>
            </Section>
        </Container>
    );
};

export default Privacy; 
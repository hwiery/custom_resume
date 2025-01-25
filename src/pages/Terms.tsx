import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 20px;
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

const Terms: React.FC = () => {
    return (
        <Container>
            <Title>이용약관</Title>
            
            <Section>
                <SectionTitle>1. 서비스 이용약관</SectionTitle>
                <Content>
                    본 이용약관은 Resumer 서비스 이용에 관한 기본적인 사항을 규정합니다.
                    서비스를 이용함으로써 본 약관에 동의하는 것으로 간주됩니다.
                </Content>
            </Section>

            <Section>
                <SectionTitle>2. 서비스 설명</SectionTitle>
                <Content>
                    Resumer는 AI 기반의 이력서 작성 및 관리 서비스를 제공합니다.
                    사용자의 경력과 경험을 바탕으로 최적화된 이력서를 작성할 수 있도록 지원합니다.
                </Content>
            </Section>

            <Section>
                <SectionTitle>3. 개인정보 보호</SectionTitle>
                <Content>
                    사용자의 개인정보는 개인정보처리방침에 따라 안전하게 보호됩니다.
                    수집된 정보는 서비스 제공 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
                </Content>
            </Section>

            <Section>
                <SectionTitle>4. 서비스 이용 제한</SectionTitle>
                <Content>
                    서비스의 안정적인 운영을 위해 다음과 같은 경우 이용이 제한될 수 있습니다:
                    - 시스템 점검 및 업데이트
                    - 불법적인 활동이 감지된 경우
                    - 타인의 권리를 침해하는 행위
                </Content>
            </Section>
        </Container>
    );
};

export default Terms; 
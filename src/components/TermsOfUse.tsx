import React from 'react';
import styled from 'styled-components';

const TermsOfUse: React.FC = () => {
    return (
        <Container>
            <Content>
                <Title>이용약관</Title>
                <LastModified>최종 수정일: 2024년 1월 25일</LastModified>

                <Section>
                    <SectionTitle>1. 약관 동의</SectionTitle>
                    <Text>
                        본 서비스(이하 "서비스")를 이용함으로써, 귀하는 본 약관 및 관련 정책(Privacy Policy 포함)에 동의하는 것으로 간주됩니다. 
                        동의하지 않으실 경우, 본 서비스를 이용할 수 없습니다.
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>2. 서비스 제공</SectionTitle>
                    <Text>
                        RESUMER(이하 "회사")는 AI 기반 이력서 작성 지원 서비스를 제공합니다.
                        회사는 서비스의 연속성 및 정확성을 위해 노력하지만, 서비스 제공이 중단되거나 지연될 수 있으며, 이에 대한 법적 책임을 지지 않습니다.
                        이력서 작성 결과에 대한 최종 책임은 사용자에게 있습니다.
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>3. 사용자의 의무</SectionTitle>
                    <Text>
                        - 사용자는 정확하고 진실된 정보를 제공해야 합니다.
                        - 사용자는 서비스를 통해 불법적이거나 비윤리적인 활동을 해서는 안 됩니다.
                        - 사용자는 타인의 권리를 침해하지 않으며, 모든 법률과 규정을 준수해야 합니다.
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>4. 책임의 제한</SectionTitle>
                    <Text>
                        - 회사는 서비스 제공 과정에서 발생한 간접적, 부수적 손해에 대해 책임을 지지 않습니다.
                        - 작성된 이력서의 내용과 결과에 대한 책임은 전적으로 사용자에게 있습니다.
                        - 기술적 문제, 데이터 손실, 서비스 중단 등 불가항력적 상황에 대해 회사는 책임을 지지 않습니다.
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>5. 지적 재산권</SectionTitle>
                    <Text>
                        회사가 제공하는 모든 자료(텍스트, 이미지, 로고, 코드 등)는 회사의 소유이며, 
                        사전 서면 동의 없이 복제, 배포, 수정할 수 없습니다.
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>6. 약관의 변경</SectionTitle>
                    <Text>
                        회사는 언제든 약관을 수정할 권리를 가지며, 변경 사항은 웹사이트에 게시되는 즉시 효력을 갖습니다. 
                        사용자는 변경된 약관에 동의하지 않을 경우, 서비스 이용을 중단해야 합니다.
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

export default TermsOfUse; 
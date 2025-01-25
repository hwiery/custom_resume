import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    max-width: 760px;
    margin: 0 auto;
    padding: 100px 20px 40px;
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
                <SectionTitle>1. 서비스 이용 약관</SectionTitle>
                <Content>
                    본 약관은 Resumer(이하 "회사")가 제공하는 이력서 작성 서비스(이하 "서비스")의 이용 조건을 정합니다.
                    서비스를 이용하시는 모든 회원은 본 약관에 동의한 것으로 간주됩니다.
                </Content>
            </Section>

            <Section>
                <SectionTitle>2. 서비스 이용</SectionTitle>
                <Content>
                    - 회원은 본인의 판단과 책임 하에 서비스를 이용합니다.
                    - 회원은 서비스 이용 시 관련 법령과 본 약관을 준수해야 합니다.
                    - 회사는 서비스의 품질 향상을 위해 서비스 내용을 변경할 수 있습니다.
                </Content>
            </Section>

            <Section>
                <SectionTitle>3. 회원의 의무</SectionTitle>
                <Content>
                    - 회원은 본인의 계정 정보를 안전하게 관리해야 합니다.
                    - 회원은 타인의 권리를 침해하거나 법령을 위반하는 행위를 해서는 안 됩니다.
                    - 서비스 이용 중 발생하는 모든 활동에 대한 책임은 회원에게 있습니다.
                </Content>
            </Section>

            <Section>
                <SectionTitle>4. 서비스 제한 및 중지</SectionTitle>
                <Content>
                    회사는 다음과 같은 경우 서비스 제공을 제한하거나 중지할 수 있습니다:
                    - 서비스 점검, 보수, 공사로 인한 부득이한 경우
                    - 회원이 본 약관을 위반한 경우
                    - 기술적 문제로 서비스 제공이 불가능한 경우
                </Content>
            </Section>
        </Container>
    );
};

export default Terms; 

import React from 'react';
import styled from 'styled-components';
import { FaEnvelope } from 'react-icons/fa';

const Container = styled.div`
    max-width: 760px;
    margin: 0 auto;
    padding: 100px 20px 40px;
    text-align: left;
`;

const Title = styled.h1`
    font-size: 24px;
    margin-bottom: 30px;
    color: #343a40;
`;

const EmailLink = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #0A66C2;
    text-decoration: none;
    font-size: 18px;
    transition: color 0.2s;

    &:hover {
        color: #0a5cab;
        text-decoration: underline;
    }

    svg {
        font-size: 20px;
    }
`;

const Description = styled.p`
    color: #6c757d;
    margin-bottom: 30px;
    font-size: 16px;
    line-height: 1.6;
`;

const Contact: React.FC = () => {
    return (
        <Container>
            <Title>문의하기</Title>
            <Description>
                서비스 이용에 관한 문의사항이 있으시다면 아래 이메일로 연락해 주세요.<br />
                빠른 시일 내에 답변 드리도록 하겠습니다.
            </Description>
            <EmailLink href="mailto:resumer@gmail.com">
                <FaEnvelope />
                resumer@gmail.com
            </EmailLink>
        </Container>
    );
};

export default Contact;

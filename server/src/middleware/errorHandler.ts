import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  code?: string;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // MongoDB 중복 키 에러
  if (err.code === '11000') {
    return res.status(400).json({
      success: false,
      error: '이미 존재하는 데이터입니다.'
    });
  }

  // JWT 인증 에러
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: '유효하지 않은 토큰입니다.'
    });
  }

  // 기본 에러 응답
  const status = err.status || 500;
  const message = err.message || '서버 에러가 발생했습니다.';

  res.status(status).json({
    success: false,
    error: message
  });
};

export default errorHandler; 
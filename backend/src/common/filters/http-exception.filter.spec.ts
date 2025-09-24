import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
	function createHostMock() {
		const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		const req: any = { url: '/test' };
		return {
			getResponse: () => res,
			getRequest: () => req,
		} as any;
	}

	it('should handle HttpException', () => {
		const filter = new AllExceptionsFilter();
		const httpMock = createHostMock();
		const host = { switchToHttp: jest.fn(() => httpMock) } as any as ArgumentsHost;
		const ex = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
		filter.catch(ex, host);
		expect(httpMock.getResponse().status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
		expect(httpMock.getResponse().json).toHaveBeenCalled();
	});

	it('should handle unknown error', () => {
		const filter = new AllExceptionsFilter();
		const httpMock = createHostMock();
		const host = { switchToHttp: jest.fn(() => httpMock) } as any as ArgumentsHost;
		filter.catch(new Error('boom'), host);
		expect(httpMock.getResponse().status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
		expect(httpMock.getResponse().json).toHaveBeenCalled();
	});
});

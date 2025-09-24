import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
	it('should wrap data with success and timestamp', (done) => {
		const interceptor = new TransformInterceptor<any>();
		const callHandler = { handle: () => of({ hello: 'world' }) } as any;
		interceptor.intercept({} as any, callHandler).subscribe((result) => {
			expect(result).toHaveProperty('success', true);
			expect(result).toHaveProperty('data');
			expect(result.data).toEqual({ hello: 'world' });
			expect(result).toHaveProperty('timestamp');
			done();
		});
	});
});

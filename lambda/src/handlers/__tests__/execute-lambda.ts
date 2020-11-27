import * as path from 'path';
import * as lambdaLocal from 'lambda-local';

export const executeLambda = async (event: any) => {
  return await lambdaLocal.execute({
    event,
    lambdaPath: path.join(__dirname, '../../../src/index.ts'),
  });
};

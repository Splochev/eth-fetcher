import * as authService from '../src/services/authService';
import * as userModel from '../src/models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import sinon from 'sinon';
import dotenv from 'dotenv';
import AuthHelpers from '../src/utils/authHelpers';
dotenv.config();
import { Request } from 'express';

const JWT_SECRET: string = process.env.JWT_SECRET || (() => {
  throw new Error("JWT_SECRET is not defined in the environment variables");
})();

describe('authService', () => {
  let findUserByUsernameStub: sinon.SinonStub;
  let bcryptCompareStub: sinon.SinonStub;
  let jwtSignStub: sinon.SinonStub;

  const mockUser = {
    id: 1,
    username: 'test',
    password: bcrypt.hashSync('test', 10)
  };

  beforeEach(() => {
    findUserByUsernameStub = sinon.stub(userModel, 'findUserByUsername').resolves(mockUser);
    bcryptCompareStub = sinon.stub(bcrypt, 'compare').resolves(true);
    jwtSignStub = sinon.stub(jwt, 'sign').returns('mock.jwt.token' as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a JWT token when credentials are valid', async () => {
    const username = 'test';
    const password = 'test';
    const result = await authService.authenticate(username, password);

    expect(result).to.have.property('token');
    expect(result.token).to.equal('mock.jwt.token');
    expect(findUserByUsernameStub.calledOnceWith(username)).to.be.true;
    expect(bcryptCompareStub.calledOnceWith(password, mockUser.password)).to.be.true;
    expect(jwtSignStub.calledOnceWith(
      { id: mockUser.id, username: mockUser.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    )).to.be.true;
  });

  it('should throw an error if the user is not found', async () => {
    findUserByUsernameStub.resolves(null);

    try {
      await authService.authenticate('nonexistent', 'test');
    } catch (err: any) {
      expect(err.message).to.equal('Invalid credentials');
    }

    expect(bcryptCompareStub.notCalled).to.be.true;
    expect(jwtSignStub.notCalled).to.be.true;
  });

  it('should throw an error if the password is incorrect', async () => {
    bcryptCompareStub.resolves(false);

    try {
      await authService.authenticate('test', 'wrongpassword');
    } catch (err: any) {
      expect(err.message).to.equal('Invalid credentials');
    }

    expect(jwtSignStub.notCalled).to.be.true;
  });

  it('should throw an error if it cannot decode the JWT token', async () => {
    const token = 'invalid jwt token';

    try {
      AuthHelpers.getUser({ headers: { auth_token: token } } as unknown as Request);
    } catch (err: any) {
      expect(err.message).to.equal('jwt malformed');
    }
  });

  it('should return a UserDto when decoding a valid JWT token', async () => {
    jwtSignStub.restore();
    const token = jwt.sign({ id: 1, username: 'test' }, JWT_SECRET, { expiresIn: '1h' });
    const user = AuthHelpers.getUser({ headers: { auth_token: token } } as unknown as Request);
    expect(user).to.deep.equal({ id: 1, username: 'test' });
  });

  it('should return a null if no token is passed as param', async () => {
    jwtSignStub.restore();
    const user = AuthHelpers.getUser({ headers: {} } as unknown as Request);
    expect(user).to.be.null;
  });
});

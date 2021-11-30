import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';
import { CommonTest } from '../helpers';
import { UsersService } from 'src/module-users/service-users/users.service';
import { User } from 'src/module-users/entities/users.entity';

describe('user controller: users infos routes (e2e)', () => {
  let app: INestApplication;
  let commons: CommonTest;
  let users: User[];
  let cookies: string[];
  let loggedUser;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commons = new CommonTest(app);
    loggedUser = commons.testUserBatch[0];
    await app.init();

    users = await commons
      .createFakeUsers()
      .then((response) => response.body)
      .catch((error) => {});
    expect(users.length).toEqual(commons.testUserBatch.length);

    cookies = await commons
      .logUser(loggedUser.login)
      .then((response) => commons.getCookies(response));
    expect(cookies.length).toBeGreaterThanOrEqual(1);
  });

  /*
  ===================================================================
  -------------------------------------------------------------------
        Auxiliary functions
  -------------------------------------------------------------------
  ===================================================================
  */

  const checkBodyAgainstUsers = (body: any) => {
    expect(body.length).toEqual(users.length);
    for (let i = 0; i < body.length; i++) {
      expect(body[i]['id']).toEqual(users[i]['id']);
      expect(body[i]['login']).toEqual(users[i]['login']);
      expect(body[i]['photo_url']).toEqual(users[i]['photo_url']);
      expect(body[i]['photo_url_42']).not.toBeDefined();
      expect(body[i]['photo_url_local']).not.toBeDefined();
      expect(body[i]['use_local_photo']).not.toBeDefined();
      expect(body[i]['friends_list']).not.toBeDefined();
      expect(body[i]['blocked_list']).not.toBeDefined();
    }
  };

  /*
    ===================================================================
    -------------------------------------------------------------------
          /users/*
    -------------------------------------------------------------------
    ===================================================================
   */

  it('gets all users', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Cookie', cookies)
      .then((resp) => {
        expect(resp.status).toEqual(HttpStatus.OK);
        expect(resp.body).toBeDefined();
        expect(resp.body.length).toBeGreaterThanOrEqual(1);
        return resp.body;
      })
      .then((body) => checkBodyAgainstUsers(body));
  });

  it('gets data for each user of the user test array', async () => {
    for (let i = 0; i < users.length; i++) {
      await request(app.getHttpServer())
      .get('/users/profile/' + users[i].login)
      .set('Cookie', cookies)
      .then((resp) => {
        expect(resp.body).toHaveProperty('id');
        expect(resp.body).toHaveProperty('login');
        expect(resp.body).toHaveProperty('photo_url');
        expect(resp.body).not.toHaveProperty('photo_url_42');
        expect(resp.body).not.toHaveProperty('photo_url_local');
        expect(resp.body).not.toHaveProperty('use_local_photo');
        expect(resp.body).not.toHaveProperty('friends_list');
        expect(resp.body).not.toHaveProperty('blocked_list');
      });
    }
  });

  it('gets data a non existing user', async () => {
    await request(app.getHttpServer())
      .get('/users/profile/' + '42_non_existing_user_login')
      .set('Cookie', cookies)
      .then((resp) => {
        expect(resp.status).toEqual(HttpStatus.NOT_FOUND);
        expect(resp.body).toHaveProperty('message', 'user not found');
      });
  });
});

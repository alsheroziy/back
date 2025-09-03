<p align="center">
  <a href="https://amediatv.uz/" target="blank"><img src="https://amediatv.uz/logo.png" width="120" alt="Nest Logo" /></a>
</p>


## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Auth
### Register
```json
/api/v1/auth/register: POST
```

#### request:

```json
{
    "name": "Name",
    "phone_number": 998999999999, // email or phone
    "email": "example@gmail.com", // email or phone
    "password": "pass123",
    "image": "/uploads/path-to-image.png" // not required
}
```

#### response:

```json
{
    "user": {
        "_id": "67b3bc926180bf3f594a22d7",
        "email": "example@gmail.com",
        "name": "Name",
        "phone_number": 998999999999,
        "image": "/uploads/path-to-image.png", // or "/uploads/profile_not_found.png",
        "email_activated": false,
        "status": true,
        "balance": 0,
        "role": "USER",
        "subscription": null,
        "transactions": []
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIzZDUwYjhhOC01NTAxLTRhN2EtYTc1My1jN2I1YWRmYzY1NWQiLCJpYXQiOjE3Mzk4MzI0NjYsImV4cCI6MTc0MTA0MjA2Nn0.Asz3gNM3wZIWaEo0POQ5JaU-Dn5pC-x7nHOIxiZ1H04",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIzZDUwYjhhOC01NTAxLTRhN2EtYTc1My1jN2I1YWRmYzY1NWQiLCJpYXQiOjE3Mzk4MzI0NjYsImV4cCI6MTc0ODkwNDQ2Nn0.2oufq-yzo44o4mHfmQ7udkCEuquN3UmkB4E7ZSh3uII"
}
```

### Login
```json
/api/v1/auth/login: POST
```

#### request:

```json

{
    "phone_number": 998999999999, // email or phone
    "password": "pass123"
}
```

#### response:

```json
{
    "user": {
        "_id": "67b3bc926180bf3f594a22d7",
        "email": "example@gmail.com",
        "name": "Name",
        "phone_number": 998999999999,
        "image": "/uploads/path-to-image.png", // or "/uploads/profile_not_found.png",
        "email_activated": false,
        "status": true,
        "balance": 0,
        "role": "USER",
        "subscription": null,
        "transactions": []
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIzZDUwYjhhOC01NTAxLTRhN2EtYTc1My1jN2I1YWRmYzY1NWQiLCJpYXQiOjE3Mzk4MzI0NjYsImV4cCI6MTc0MTA0MjA2Nn0.Asz3gNM3wZIWaEo0POQ5JaU-Dn5pC-x7nHOIxiZ1H04",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIzZDUwYjhhOC01NTAxLTRhN2EtYTc1My1jN2I1YWRmYzY1NWQiLCJpYXQiOjE3Mzk4MzI0NjYsImV4cCI6MTc0ODkwNDQ2Nn0.2oufq-yzo44o4mHfmQ7udkCEuquN3UmkB4E7ZSh3uII"
}
```

### Refresh Token
```json
/api/v1/auth/refresh: POST
```

#### request:

```json

{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIyMmI3MDlhNi1jN2U5LTQxMTgtOWNlNy1lNjU2ZWM2Y2UyYTgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTczOTgzNDMzMCwiZXhwIjoxNzQ4OTA2MzMwfQ.u9nXrpxyFghCY3-5wPbPL5G4IvoDMymctA3Qn6Z-QFQ"
}
```

#### response:

```json
{
    "user": {
        "_id": "67b3bc926180bf3f594a22d7",
        "email": "example@gmail.com",
        "name": "Name",
        "phone_number": 998999999999,
        "image": "/uploads/path-to-image.png", // or "/uploads/profile_not_found.png",
        "email_activated": false,
        "status": true,
        "balance": 0,
        "role": "USER",
        "subscription": null,
        "transactions": []
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIzZDUwYjhhOC01NTAxLTRhN2EtYTc1My1jN2I1YWRmYzY1NWQiLCJpYXQiOjE3Mzk4MzI0NjYsImV4cCI6MTc0MTA0MjA2Nn0.Asz3gNM3wZIWaEo0POQ5JaU-Dn5pC-x7nHOIxiZ1H04",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIzZDUwYjhhOC01NTAxLTRhN2EtYTc1My1jN2I1YWRmYzY1NWQiLCJpYXQiOjE3Mzk4MzI0NjYsImV4cCI6MTc0ODkwNDQ2Nn0.2oufq-yzo44o4mHfmQ7udkCEuquN3UmkB4E7ZSh3uII"
}
```

### Get user from access token
```json
/api/v1/users/me: GET
```

#### response:

```json
{
    "user": {
        "_id": "67b3bc926180bf3f594a22d7",
        "email": "example@gmail.com",
        "name": "Name",
        "phone_number": 998999999999,
        "image": "/uploads/path-to-image.png", // or "/uploads/profile_not_found.png",
        "email_activated": false,
        "status": true,
        "balance": 0,
        "role": "USER",
        "subscription": null,
        "transactions": []
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIzZDUwYjhhOC01NTAxLTRhN2EtYTc1My1jN2I1YWRmYzY1NWQiLCJpYXQiOjE3Mzk4MzI0NjYsImV4cCI6MTc0MTA0MjA2Nn0.Asz3gNM3wZIWaEo0POQ5JaU-Dn5pC-x7nHOIxiZ1H04",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdiM2JjOTI2MTgwYmYzZjU5NGEyMmQ3IiwidG9rZW5faWQiOiIzZDUwYjhhOC01NTAxLTRhN2EtYTc1My1jN2I1YWRmYzY1NWQiLCJpYXQiOjE3Mzk4MzI0NjYsImV4cCI6MTc0ODkwNDQ2Nn0.2oufq-yzo44o4mHfmQ7udkCEuquN3UmkB4E7ZSh3uII"
}
```

# Plans
### Create
```json
/api/v1/plans: POST
```

#### request:

```json
{
    "name": {
        "uz": "6 oylik",
        "ru": "6 mesya"
    },
    "price": 68000,
    "time": 6
}
```

#### response:

```json
{
    "name": {
        "uz": "6 oylik",
        "ru": "6 mesya",
        "_id": "67b3cafb77d0d997bc998aec"
    },
    "price": 68000,
    "time": 6,
    "_id": "67b3cafb77d0d997bc998aeb",
    "createdAt": "2025-02-17T23:49:15.233Z",
    "updatedAt": "2025-02-17T23:49:15.233Z",
    "__v": 0
}
```

### Get All Plans
```json
/api/v1/plans: GET
```

#### response:

```json
{
    "pagination": {
        "page": 1,
        "limit": 50,
        "total": 3,
        "pages": 1,
        "next": null
    },
    "data": [
        {
            "_id": "67b3ca8d76e5cd2496a18daa",
            "name": {
                "uz": "4 oylik",
                "ru": "4 mesya",
                "_id": "67b3ca8d76e5cd2496a18dab"
            },
            "price": 30000,
            "time": 4,
            "createdAt": "2025-02-17T23:47:25.299Z",
            "updatedAt": "2025-02-17T23:47:25.299Z",
            "__v": 0
        },
        {
            "_id": "67b3caab76e5cd2496a18daf",
            "name": {
                "uz": "1 oylik",
                "ru": "1 mesya",
                "_id": "67b3caab76e5cd2496a18db0"
            },
            "price": 12000,
            "time": 1,
            "createdAt": "2025-02-17T23:47:55.561Z",
            "updatedAt": "2025-02-17T23:47:55.561Z",
            "__v": 0
        },
        {
            "_id": "67b3cafb77d0d997bc998aeb",
            "name": {
                "uz": "6 oylik",
                "ru": "6 mesya",
                "_id": "67b3cafb77d0d997bc998aec"
            },
            "price": 68000,
            "time": 6,
            "createdAt": "2025-02-17T23:49:15.233Z",
            "updatedAt": "2025-02-17T23:49:15.233Z",
            "__v": 0
        },
        //
    ]
}
```

### Update
```bash
/api/v1/plans/[id]: PATCH
```

#### request:

```json
{
    "name": {
        "uz": "12 oylik",
        "ru": "12 mesya"
    },
    "price": 120000,
    "time": 12
}
```
#### response:

```json
{
    "success": true,
    "data": {
        "_id": "67b3ca8d76e5cd2496a18daa",
        "name": {
            "uz": "12 oylik",
            "ru": "12 mesya",
            "_id": "67b3cd6c16a34c5b8104adeb"
        },
        "price": 120000,
        "time": 12,
        "createdAt": "2025-02-17T23:47:25.299Z",
        "updatedAt": "2025-02-17T23:59:40.862Z",
        "__v": 0
    }
}
```

### Delete
```bash
/api/v1/plans/[id]: DELETE
```

#### response:

```json
{
    "success": true,
    "data": {
        "_id": "67b3ca8d76e5cd2496a18daa",
        "name": {
            "uz": "12 oylik",
            "ru": "12 mesya",
            "_id": "67b3cd6c16a34c5b8104adeb"
        },
        "price": 120000,
        "time": 12,
        "createdAt": "2025-02-17T23:47:25.299Z",
        "updatedAt": "2025-02-17T23:59:40.862Z",
        "__v": 0
    }
}
```

<!-- ## Stay in touch

- Author - [Usmonjon Xasanov](https://twitter.com/kammysliwiec)
- Website - [www.usmonjon.uz](https://www.usmonjon.uz)
- Twitter - [@devusmonjon](https://twitter.com/devusmonjon) -->

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

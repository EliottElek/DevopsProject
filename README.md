# DevopsProject

## 1. Create a web application

We decided not to go on with the small API provided, but rather to go and deploy the backend we used for our webtech project. This backend api consists of multiple methods and functions, but also 19 unit tests. 

![image](https://user-images.githubusercontent.com/64375473/147007818-4e8ff71b-2288-4ce7-aae7-bca43a7150a1.png)

  
## 2. CI/CD Pipeline

For the CI/CD pipeline, we decided to use github actions along with cloud deployment plateform Heroku. We first started by creating a `.github` folder inside which we created a `main.yml` file, the following : 

```
name: Main CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # CI part
  test:
    runs-on: ubuntu-latest
     # Service containers to run with `runner-job`
    defaults:
     run:
      working-directory: api
    strategy:
      matrix:
        node-version: [16.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js 16.13.1
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: '**/package-lock.json'
    - run: npm ci
    - run: npm test
  # CD part
  deploy:
    needs: test # Requires CI part to be succesfully completed
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # Read instructions how to configure this action: https://github.com/marketplace/actions/deploy-to-heroku#getting-started
      - uses: akhileshns/heroku-deploy@v3.12.12 # This is the action
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "chateex" # Must be unique in Heroku
          heroku_email: ${{ secrets.HEROKU_EMAIL }} # Heroku account email
          appdir: api # Define appdir if you application is in a subfolder
```
As you can see in the following picture, the CI/CD pipeline is working correctly.

![image](https://user-images.githubusercontent.com/64375473/147008475-7464c6c8-4df8-418a-8462-020b0ff4025d.png)

## 3. Configure and provision a virtual environment and run your application using the IaC approach

We started by restructuring our project. in one folder `api` we have our application. Then we created a `iac` folder which is structured like the following : 

```
iac/
  Vagrantfile
  playbooks/
    roles/
     gitlab/
      healthchecks/
       tasks/
        main.yml
      install/
       tasks/
        main.yml
```
## 4. Build Docker image of the application

  To build a Docker image, we first started by creating a `image` folder in the root of our projet. inside of it, we created a `Dockerfile`, which is :
  
  ```
  FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start"]
  ```
Then, we registered on docker hub. We only created one account, which is under the username "eliottelekkk".

First we list our docker images with `docker images` :

`chateex                              latest                                                  9787b1128b10   36 hours ago   946MB`

This one is the one that interestes us. Then we login to docker hub : 

![image](https://user-images.githubusercontent.com/64375473/147009781-cf45c789-a130-45a9-87f3-f6181bfd8b9d.png)

Then we push the image on docker hub (says "layer already exists" because we retyped the command for the purpose): 

![image](https://user-images.githubusercontent.com/64375473/147010123-20f99cbf-d063-42f9-87ba-00225b55c0d5.png)

We can pull the image to see : 

![image](https://user-images.githubusercontent.com/64375473/147010305-336f7554-60dd-4e62-adaa-502c361af3d2.png)
![image](https://user-images.githubusercontent.com/64375473/147010337-71e6058d-808a-490b-839b-43160588c5e0.png)

We also added a `.dockerignore` to our project.

## 5. Create a `docker-compose.yaml` file

We create a `docker-compose.yaml` in the `/image` folder, which is the following : 

```
version: '3'
services:
  web:
    image : docker.io/eliottelekkk/chateex:latest
```

To run, place yourself in the `/image` folder and run `docker-compose up` : 

![image](https://user-images.githubusercontent.com/64375473/147011145-ffbd783e-ff90-4cff-af95-87804598b50b.png)

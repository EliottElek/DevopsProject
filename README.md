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
RUN npm cache clean --force
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
  ```
  
Next, we can build our docker container with the command `docker build -t chateex .` : 

![image](https://user-images.githubusercontent.com/64375473/147075964-dbabab04-ccc6-4b83-891f-5deba242cb7b.png)

Then we can run the image to see if it works with `docker run -p 3222:8080 chateex` :

![image](https://user-images.githubusercontent.com/64375473/147083744-8503de64-c641-4da6-8a41-2693f70690f5.png)

![image](https://user-images.githubusercontent.com/64375473/147083880-323ac3b2-309f-4bee-af99-54bb4b9883fd.png)


Then, we registered on docker hub. We only created one account, which is under the username "eliottelekkk".

First we list our docker images with `docker images` :

`chateex                              latest                                                  9787b1128b10   36 hours ago   946MB`

This one is the one that interestes us. Then we login to docker hub : 

![image](https://user-images.githubusercontent.com/64375473/147009781-cf45c789-a130-45a9-87f3-f6181bfd8b9d.png)

NExt we tag our container to our account with `docker tag chateex eliottelekkk/chateex` :

![image](https://user-images.githubusercontent.com/64375473/147072714-3e392a81-209d-4fce-aaa7-9b2d095aa379.png)

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
    ports:
      - "8080:8080"
```

To run, place yourself in the `/image` folder and run `docker-compose up` : 

![image](https://user-images.githubusercontent.com/64375473/147087032-b9092e58-f8ff-4c2e-9f39-a74526dc3f80.png)

And we can see that our app is running using docker-compose : 

![image](https://user-images.githubusercontent.com/64375473/147087144-12e600ce-53a3-491e-8215-bc792f0093cd.png)

## 4. Container orcherstration with Kubernetes

We first started by installing minikube. Then we created a `k8s` folder in which whe created a `deployment.yaml` file : 

```
apiVersion: v1
kind: Service
metadata:
  name: chateex-service
spec:
  selector:
    app: chateex
  ports:
  - protocol: "TCP"
    name : http
    port: 80
    targetPort: 80
  type: LoadBalancer

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chateex-app
spec:
  selector:
    matchLabels:
      app: chateex
  replicas: 5
  template:
    metadata:
      labels:
        app: chateex
    spec:
      containers:
      - name: chateex
        image: docker.io/eliottelekkk/chateex:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 5000
```

With this folder created, we can apply it with `kubectl apply -f deployment.yaml` :

![image](https://user-images.githubusercontent.com/64375473/147014349-f9fe92bd-ffa5-415d-a03d-8a4dcf8b027d.png)

(Should say service created and deployement created when running this command for the first time.)

This is what we get when we type the command `kubectl get services` :

![image](https://user-images.githubusercontent.com/64375473/147014534-939ebb66-2bc6-4089-9af2-1a8ec8884c1b.png)

This is what we get when we type the command `kubectl get deployments` :

![image](https://user-images.githubusercontent.com/64375473/147014970-521c91e1-d263-49ba-96f4-478162802849.png)

And when we try to list our pods with `kubectl get pods`, this is what we get : 

![image](https://user-images.githubusercontent.com/64375473/147014584-b5a17977-9bb8-4a5b-818e-57333fe4395d.png)

We can see our 5 replicas running. 

If we change the number of replicas from 5 to 15 and re-apply changes with `kubectl apply -f deployment.yaml`, and then list the pods with `kubectl get pods` : 

![image](https://user-images.githubusercontent.com/64375473/147068943-0fe7db01-c30f-4aba-8fb8-ce7bda35edfb.png)

We can see our 15 replicas running. 
We first tried to install Istio with `istioctl` but we only succeeded in installing the `minimal` profile. `Default` or `demo` were not working. But with this installation profile, there was missing the ingress and egress gateway and we needed the ingress gateway to start the routing request configuration. So we tried with an another technique which appeared to be the <a href = "https://istio.io/latest/docs/setup/install/operator/" >Istio Operator Install</a>. Thank to this installation, we managed to follow the tutorial to configure the request routing and we had results : 

![image](https://user-images.githubusercontent.com/60350297/147132191-1d280a8b-76ca-4fd9-bce0-71c77924ae02.png)

But we didn't succeed to configure it for our application.

## 8. Implement Monitoring to your containerized application

We were not able to download prometheus because they do not provide a MacOS version.

![image](https://user-images.githubusercontent.com/60350297/147130707-af2499f3-5c7b-434e-bf1e-09c0c2062ae8.png)

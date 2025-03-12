# Pub_Essential_api

*如何run locally

1. 用Docker compose(比较轻松但我不喜欢因为不好连接到pgadmin):
在有docker-compose.yml 的地方 run: 
docker-compose build 
docker-compose up -d

2. 从docker hub 里搞一个postgre 和 redis 然后run：
py manage.py runserver 0.0.0.0：8000


*成功run app 之后, 访问 localhost:8000/api/schema/swagger-ui/ 或者 localhost:8000/api/schema/redoc/ 来查看api
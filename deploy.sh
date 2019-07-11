#!/bin/bash

git pull
bower install --allow-root
npm install
npm run build
# 拷贝当前目录的dist到nginx部署的文件夹
rm -rf $1
echo delete succeed $1
cp -rf dist/. $1
echo copy succeed $1

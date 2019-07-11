#!/bin/bash
case $1 in
    start)
        gulp serve
        ;;
    build)
        gulp
        tar cvzf dist.tar.gz dist
        ;;
    commit)
        git add .
        git reset Head gulp/server.js
        case $2 in
            *)
                git commit -m "$2" 
            ;;
        esac
        git pull
        git status
        ;; 
    push)
        git push
        ;;
    tar)
        tar cvzf dist.tar.gz dist
        ;;
    build-usb)
        gulp
        tar cvzf dist.tar.gz dist
        rm -rf /Volumes/启动区/dist.tar_old.gz
        mv /Volumes/启动区/dist.tar.gz /Volumes/启动区/dist.tar_old.gz
        cp dist.tar.gz /Volumes/启动区
        ;;
    file-move)
        rm -rf /Volumes/启动区/dist.tar_old.gz
        mv /Volumes/启动区/dist.tar.gz /Volumes/启动区/dist.tar_old.gz
        cp dist.tar.gz /Volumes/启动区
        ;;
    *)
        ;;
esac 
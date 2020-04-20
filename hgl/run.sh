#!/bin/bash
sleep 1 && open "http://localhost:8000" &
php -S localhost:8000 -t ~/devel/hgl;
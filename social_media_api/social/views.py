import requests
from django.db.models import Q
from django.shortcuts import render,get_object_or_404,get_list_or_404
from django.http import request
from .models import *
# Create your views here.

def home(request):
    posts=Post.objects.all().order_by('-date_published')
    context={"posts":posts}
    return render(request, 'social/home.html',context)

def login(request):
    return render(request,'social/login.html')

import requests
from django.db.models import Q
from django.shortcuts import render,get_object_or_404,get_list_or_404
from django.http import request
from .models import *
# Create your views here.

def home(request):
    posts=Post.objects.all().order_by('-date_published')
#    suggested_users=suggested_users(request.username)
    context={"posts":posts}
    return render(request, 'social/home.html',context)

def login(request):
    return render(request,'social/login.html')


#def suggested_users(current_user):
#    friends = current_user.friends.all()
#
#    followed_by_friends = CustomUser.objects.filter(friends__in=friends).exclude(
#        Q(id=current_user.id) | Q(id__in=friends)
#    ).distinct()[:5]
#
#    return followed_by_friends

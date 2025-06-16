from django.shortcuts import render,get_object_or_404,get_list_or_404
from django.http import request
# Create your views here.

def home(request):
    context={}
    return render(request, 'social/home.html',context)

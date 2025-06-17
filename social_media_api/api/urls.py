from django.shortcuts import get_object_or_404
from django.urls import include,path
from .views import *
app_name="api"
urlpatterns=[
    path('users/',UserListView.as_view(),name='users'),
    path('profile/',ProfileView.as_view(),name='profile'),
]
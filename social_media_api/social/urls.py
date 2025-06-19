from django.urls import path,include
from . import views

app_name = 'social'
urlpatterns = [
    path('home/',views.home,name='home'),
    path('',views.home,name='home'),
    path('login/',views.login,name='login'),
]

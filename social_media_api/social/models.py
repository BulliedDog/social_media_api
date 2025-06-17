from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class CustomUser(AbstractUser):
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    friends = models.ManyToManyField('self', blank=True, symmetrical=True,related_name='friends')
    class Meta:
        ordering = ['username']
        managed = True
        verbose_name = 'CustomUser'
        verbose_name_plural = 'CustomUsers'

    def __str__(self):
        return self.username

class Post(models.Model):
    title=models.CharField(blank=False,null=False,max_length=200)
    description=models.CharField(blank=True,max_length=1000)
    author=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    image=models.ImageField(upload_to='post_pics/',null=True,blank=True)
    date_published=models.DateTimeField("date published", auto_now_add=True)
    class Meta:
        ordering=['date_published','title']
        managed = True
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
    def __str__(self):
        return self.title


class Comment(models.Model):
    author=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    text=models.CharField(max_length=500,blank=False)
    class Meta:
        managed = True
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
    def __str__(self):
        return self.text
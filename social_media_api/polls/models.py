from django.db import models
from django.utils import timezone

# Create your models here.
class Question(models.Model):
    question_text=models.CharField(max_length=200)
    pub_date=models.DateTimeField("date published", auto_now=False, auto_now_add=False)
    def __str__(self):
        return self.question_text

class Choice(models.Model):
    question=models.ForeignKey(Question,on_delete=models.CASCADE)
    choice_text=models.CharField(max_length=500)
    votes=models.IntegerField(default=0)
    def __str__(self):
        return self.choice_text
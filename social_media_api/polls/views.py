from django.shortcuts import get_object_or_404, render
from django.http import HttpRequest,HttpResponse,Http404
from .models import *

# Create your views here.
def index(request):
    latest_question_list = Question.objects.order_by("-pub_date")#[:5] se voglio le ultime 5 domande (operatore di slicing)
    context = {"latest_question_list": latest_question_list}
    #questa shortcut render permette di caricare il template e buttarci dentro la richiesta http e il contesto dei parametri
    return render(request, "polls/index.html", context)

def detail(request, question_id):
    #altra shortcut, permette di richiedere una specifica risorsa (object) dal db, se non presente carica la pagina di errore 404
    question = get_object_or_404(Question, pk=question_id)
    #try:
    #    question = Question.objects.get(pk=question_id)
    #except Question.DoesNotExist:
    #    raise Http404("Question does not exist")
    context={"question":question}
    return render(request, "polls/detail.html", context)

def results(request, question_id):
    response = "You're looking at the results of question %s."
    return HttpResponse(response % question_id)

def vote(request, question_id):
    return HttpResponse("You're voting on question %s." % question_id)
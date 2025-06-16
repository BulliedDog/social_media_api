from django.shortcuts import get_object_or_404, render
from django.http import HttpRequest,HttpResponse,Http404,HttpResponseRedirect
from django.urls import reverse
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
    question = get_object_or_404(Question, pk=question_id)
    return render(request,'polls/results.html',{"question":question})

def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    try:
        selected_choice = question.choice_set.get(pk=request.POST["choice"])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the question voting form.
        return render(
            request,
            "polls/detail.html",
            {
                "question": question,
                "error_message": "You didn't select a choice.",
            },
        )
    else:
        selected_choice.votes = selected_choice.votes + 1
        selected_choice.save()
        # Always return an HttpResponseRedirect after successfully dealing
        # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        return HttpResponseRedirect(reverse("polls:results", args=(question.id,)))
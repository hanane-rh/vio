from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

def login_view(request):
    return render(request, 'authentication/login.html')

def register_view(request):
    return render(request, 'authentication/register.html')

def logout_view(request):
    logout(request)
    return redirect('login')
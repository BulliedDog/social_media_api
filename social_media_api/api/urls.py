from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import UserViewSet, PostViewSet, CommentViewSet, RegisterViewSet, UserProfileView, toggle_like
from django.urls import include,path

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'register', RegisterViewSet, basename='register') #had to add basename since it uses the very same name from the model  
urlpatterns = [
    path('',include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserProfileView.as_view(), name='user-profile'),
    path('posts/<int:post_id>/like/', toggle_like, name='toggle_like'),
]

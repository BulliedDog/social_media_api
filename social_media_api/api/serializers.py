from rest_framework import serializers
from social.models import CustomUser, Post, Comment
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    mutual_friends_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = '__all__'

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj in request.user.friends.all()
        return False

    def get_mutual_friends_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_friends = set(request.user.friends.all())
            obj_friends = set(obj.friends.all())
            return len(user_friends.intersection(obj_friends))
        return 0

class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    likes_count = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['author', 'author_username', 'date_published', 'image_url']
    def get_likes_count(self, obj):
        return obj.likes.count()
    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, "user") and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True,label="Repeat password")

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'bio']
        extra_kwargs = {'email': {'required': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            bio=validated_data.get('bio', '')
        )
        #this way everyone who registers will become a normal user and not a django superuser, this changes permission to users
        user.is_staff = False
        user.is_superuser = False
        user.save()
        return user

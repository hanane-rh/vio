# notifications/management/commands/init_daily_notifications.py

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from notifications.models import Notification
from datetime import time


class Command(BaseCommand):
    help = 'Initialise les 6 notifications quotidiennes pour tous les utilisateurs'

    def handle(self, *args, **kwargs):
        # Les 6 notifications Ã  crÃ©er chaque jour
        DAILY_NOTIFICATIONS = [
            {
                'title': 'Reminder!',
                'message': '"Hey, don\'t forget to check your routines before midnight, continue on your progress you can do it"',
                'notification_type': 'reminder',
                'icon': 'ðŸ‘¤',
                'scheduled_time': time(23, 0),  # 23:00
            },
            {
                'title': 'Reminder!',
                'message': '"Good morning, it\'s time for your taking medicine routine, don\'t forget to check it"',
                'notification_type': 'reminder',
                'icon': 'ðŸ’Š',
                'scheduled_time': time(8, 0),  # 08:00
            },
            {
                'title': 'Breathing',
                'message': '"How are you? do you think of taking a good breath today?"',
                'notification_type': 'breathing',
                'icon': 'ðŸ‘¤',
                'scheduled_time': time(14, 0),  # 14:00
            },
            {
                'title': 'Reminder!',
                'message': '"Hey, don\'t forget to check your routines before midnight, continue on your progress you can do it"',
                'notification_type': 'reminder',
                'icon': 'ðŸ‘¤',
                'scheduled_time': time(22, 0),  # 22:00
            },
            {
                'title': 'Reminder!',
                'message': '"Good morning, it\'s time for your taking medicine routine, don\'t forget to check it"',
                'notification_type': 'reminder',
                'icon': 'ðŸ’Š',
                'scheduled_time': time(9, 0),  # 09:00
            },
            {
                'title': 'Breathing',
                'message': '"How are you? do you think of taking a good breath today?"',
                'notification_type': 'breathing',
                'icon': 'ðŸ‘¤',
                'scheduled_time': time(16, 0),  # 16:00
            },
        ]

        users = User.objects.all()
        created_count = 0

        for user in users:
            # Supprimer les anciennes notifications de la journÃ©e
            Notification.objects.filter(user=user, is_dismissed=False).delete()
            
            # CrÃ©er les 6 nouvelles notifications
            for notif_data in DAILY_NOTIFICATIONS:
                Notification.objects.create(
                    user=user,
                    **notif_data
                )
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'âœ… {created_count} notifications crÃ©Ã©es pour {users.count()} utilisateur(s)'
            )
        )
# Generated by Django 5.1.3 on 2025-03-02 22:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0029_remove_reservation_final_price'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reservation',
            name='products',
        ),
    ]

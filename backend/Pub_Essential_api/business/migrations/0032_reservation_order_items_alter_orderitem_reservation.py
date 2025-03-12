# Generated by Django 5.1.3 on 2025-03-02 23:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0031_reservation_base_price_reservation_final_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='order_items',
            field=models.ManyToManyField(related_name='reservations', through='business.OrderItem', to='business.product'),
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='reservation',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='business.reservation'),
        ),
    ]

# Generated by Django 5.1.3 on 2025-03-02 21:51

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0027_remove_recurringdiscount_unique_discount_slot_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reservation',
            name='base_price',
        ),
        migrations.RemoveField(
            model_name='reservation',
            name='orders',
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('price_at_order', models.DecimalField(decimal_places=2, max_digits=10)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_items', to='business.product')),
                ('reservation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_items', to='business.reservation')),
            ],
            options={
                'unique_together': {('reservation', 'product')},
            },
        ),
        migrations.AddField(
            model_name='reservation',
            name='products',
            field=models.ManyToManyField(related_name='reservations', through='business.OrderItem', to='business.product'),
        ),
    ]

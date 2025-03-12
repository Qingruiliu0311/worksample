# Generated by Django 5.1.3 on 2024-11-30 19:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('User_management', '0004_customuser_is_vendor'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='shopaddress',
            new_name='Businessaddress',
        ),
        migrations.RenameField(
            model_name='customuser',
            old_name='shopname',
            new_name='Businessname',
        ),
        migrations.RenameField(
            model_name='customuser',
            old_name='shopnumber',
            new_name='Contactnumber',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='city',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='postcode',
        ),
        migrations.AddField(
            model_name='customuser',
            name='Firstname',
            field=models.CharField(default='Qingrui', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='customuser',
            name='Lastname',
            field=models.CharField(default='Liu', max_length=100),
            preserve_default=False,
        ),
    ]

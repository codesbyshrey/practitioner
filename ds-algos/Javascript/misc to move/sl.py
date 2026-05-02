from django.test import TestCase
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from authentication.models import CustomUser
from .models import Appointments, Professional, Services, PreSelection
from users.models import Alert


# Create your tests here.
# Create your tests here.

class AppointmentUpdateNotificationTest(TestCase):
    # setup professional, client, service, preselection, and appointment
    def setUp(self):
        # create test user
        self.user = CustomUser.objects.create(
            # id='0227490f-2157-438b-9f9c-f74348b71438',
            email='test@example.com',
            password='testpassword',
            user_type='CL',
            first_name='testfname',
            last_name='testlname',
            phone_number='6268182838',
        )

        # create test professional
        # self.expert = CustomUser.objects.create(
        #     id='6a29a729-b792-47a0-8c06-966938587323',
        #     email='proftest@example.com',
        #     password='profpassword',
        #     user_type='EX',
        #     first_name='exfname',
        #     last_name='exlname',
        #     phone_number='6267777777',
        # )

        # create professional
        self.professional = Professional.objects.create(
            client_id=self.user,
            name='exfname exlname',
            prof_type='BARBER',
            vaccinated=True,
            licensed=True,
            dist_travel=10,
            always_available=True,
            cancellation_fee_hours=1,
            cancellation_fee_percent=1,
            appointments_completed=1,
            vip=True,
            price_min=1,
            price_max=2,
            is_priority=True,
        )

        # create service
        self.service = Services.objects.create(
            prof_id=self.professional,
            service='barber',
            service_variables='barber',
            price_women=1,
            price_men=1,
            price_kid=1,
            price_senior=1,
        )

        # create preselection
        self.preselection = PreSelection.objects.create(
            client_id=self.user,
            location='Test Location',
            on_site=True,
            appt_time='14:30:00',
            appt_date='2023-08-15',
            type='MEN',
            service_type='BARBER',
            service_id=self.service.id,
        )

        # create appointment
        self.appointment = Appointments.objects.create(
            prof_id=self.professional,
            client_id=self.user,
            distance=1,
            location='california',
            start_time_of_appt='2024-07-17 19:33:09.304-07',
            appt_duration='00:00:02',
            preselection=self.preselection,
        )

    def test_alert_created_on_appointment_update(self):
        url = reverse('update_appointment', args=[str(self.appointment.appointment_key)])
        data = {
            'prof_id': self.professional.prof_id,
            'client_id': self.user.id,
            'distance': 2,
            'location': 'california',
            'start_time_of_appt': '2024-07-18 19:33:09.304-07',
            'appt_duration': '00:00:02',
            'preselection': self.preselection.preselection_id,
        }
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Alert.objects.count(), 1)

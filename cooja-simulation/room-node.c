#include "contiki.h"
#include "contiki-net.h"
#include "net/ipv6/simple-udp.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define UDP_PORT 8765

static struct simple_udp_connection udp_conn;

PROCESS(smart_office_process, "Smart Office - Open Workspace");
AUTOSTART_PROCESSES(&smart_office_process);

PROCESS_THREAD(smart_office_process, ev, data)
{
  static struct etimer timer;

  static int temperature;
  static int humidity;
  static int light;
  static int motion;
  static int smoke;

  static int light_status;
  static int fan_status;
  static int ac_status;
  static int alarm_status;

  static char message[128];

  uip_ipaddr_t destination;

  PROCESS_BEGIN();

  printf("====================================\n");
  printf(" SMART OFFICE - OPEN WORKSPACE\n");
  printf(" Sensor Node Started\n");
  printf("====================================\n");

  /* Register UDP connection */
  simple_udp_register(
      &udp_conn,
      UDP_PORT,
      NULL,
      UDP_PORT,
      NULL
  );

  etimer_set(&timer, CLOCK_SECOND * 5);

  while(1) {

    PROCESS_WAIT_EVENT_UNTIL(etimer_expired(&timer));

    /* -----------------------------
       Generate simulated sensors
       ----------------------------- */

    temperature = 24 + (rand() % 10);
    humidity    = 40 + (rand() % 31);
    light       = 100 + (rand() % 501);
    motion      = rand() % 2;
    smoke       = rand() % 21;

    /* -----------------------------
       Reset device states
       ----------------------------- */

    light_status = 0;
    fan_status   = 0;
    ac_status    = 0;
    alarm_status = 0;

    /* -----------------------------
       Smart automation
       ----------------------------- */

    if(motion == 1) {

      if(light < 300) {
        light_status = 1;
      }

      if(temperature > 28) {
        fan_status = 1;
      }

      if(temperature > 32) {
        ac_status = 1;
      }
    }

    if(smoke > 15) {
      alarm_status = 1;
    }

    /* -----------------------------
       Display sensor information
       ----------------------------- */

    printf("\n========== OPEN WORKSPACE ==========\n");

    printf("Temperature : %d C\n", temperature);
    printf("Humidity    : %d %%\n", humidity);
    printf("Light       : %d lux\n", light);

    printf("Occupancy   : %s\n",
           motion ? "OCCUPIED" : "EMPTY");

    printf("Smoke       : %d\n", smoke);

    printf("\n---------- DEVICE STATUS -----------\n");

    printf("Smart Light : %s\n",
           light_status ? "ON" : "OFF");

    printf("Fan         : %s\n",
           fan_status ? "ON" : "OFF");

    printf("AC          : %s\n",
           ac_status ? "ON" : "OFF");

    printf("Smoke Alarm : %s\n",
           alarm_status ? "ON" : "OFF");

    /* -----------------------------
       Build DATA packet
       ----------------------------- */

    snprintf(
        message,
        sizeof(message),
        "DATA,%d,%d,%d,%d,%d,%d,%d,%d,%d",
        temperature,
        humidity,
        light,
        motion,
        smoke,
        light_status,
        fan_status,
        ac_status,
        alarm_status
    );

    printf("%s\n", message);

    /* -----------------------------
       Send packet to all nearby
       IPv6 nodes using multicast
       ----------------------------- */

    uip_create_linklocal_allnodes_mcast(&destination);

    simple_udp_sendto(
        &udp_conn,
        message,
        strlen(message),
        &destination
    );

    printf("UDP packet sent to Gateway\n");
    printf("====================================\n");

    etimer_reset(&timer);
  }

  PROCESS_END();
}

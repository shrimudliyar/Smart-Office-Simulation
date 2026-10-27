#include "contiki.h"
#include "contiki-net.h"
#include "net/ipv6/simple-udp.h"

#include <stdio.h>
#include <string.h>

#define UDP_PORT 8765

static struct simple_udp_connection udp_conn;

PROCESS(gateway_process, "Smart Office Gateway");
AUTOSTART_PROCESSES(&gateway_process);

/* Called whenever the gateway receives a UDP packet */
static void
receiver(struct simple_udp_connection *c,
         const uip_ipaddr_t *sender_addr,
         uint16_t sender_port,
         const uip_ipaddr_t *receiver_addr,
         uint16_t receiver_port,
         const uint8_t *data,
         uint16_t datalen)
{
  char message[128];

  if(datalen >= sizeof(message)) {
    datalen = sizeof(message) - 1;
  }

  memcpy(message, data, datalen);
  message[datalen] = '\0';

  printf("\n====================================\n");
  printf(" SMART OFFICE GATEWAY\n");
  printf(" Data received from Room Mote\n");
  printf("------------------------------------\n");

  printf("%s\n", message);

  printf("====================================\n");
}

PROCESS_THREAD(gateway_process, ev, data)
{
  PROCESS_BEGIN();

  printf("====================================\n");
  printf(" SMART OFFICE GATEWAY STARTED\n");
  printf(" Waiting for room sensor data...\n");
  printf("====================================\n");

  simple_udp_register(
      &udp_conn,
      UDP_PORT,
      NULL,
      UDP_PORT,
      receiver
  );

  PROCESS_END();
}

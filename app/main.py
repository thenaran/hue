#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright 2012-2014 Narantech Inc. All rights reserved.
#  __    _ _______ ______   _______ __    _ _______ _______ _______ __   __
# |  |  | |   _   |    _ | |   _   |  |  | |       |       |       |  | |  |
# |   |_| |  |_|  |   | || |  |_|  |   |_| |_     _|    ___|       |  |_|  |
# |       |       |   |_||_|       |       | |   | |   |___|       |       |
# |  _    |       |    __  |       |  _    | |   | |    ___|      _|       |
# | | |   |   _   |   |  | |   _   | | |   | |   | |   |___|     |_|   _   |
# |_|  |__|__| |__|___|  |_|__| |__|_|  |__| |___| |_______|_______|__| |__|


""" Philips Hue main
"""
# default
import logging
import os
import os.path
import random

# clique
import clique
import clique.isc
import clique.event
from clique import web
from clique import runtime
from clique.web import endpoint
from clique.util import Timer

# ambiency
import ambiency
from ambiency import actuators
from ambiency import build_actuator
from ambiency import build_action
from ambiency import build_action_data_type
from ambiency import build_source

# phue
from phue import Bridge
from phue import AllLights


def get_light(light_id):
  bridge = _get_bridge()
  if light_id:
    light = bridge.lights_by_id[light_id]
  else:
    light = AllLights(bridge)
  return light


@endpoint()
def get_bridge():
  bridge = _get_bridge()
  if bridge:
    data = {'name': bridge.name,
            'ip': bridge.ip,
            }
    return data
  return


@endpoint()
def get_lights():
  bridge = _get_bridge()
  results = []
  for light in bridge.lights:
    data = {'ident': light.light_id,
            'name': light.name,
            'on': light.on,
            'brightness': light.brightness,
            'x': light.xy[0],
            'y': light.xy[1],
            }
    results.append(data)
  return results


@endpoint()
def ping(light_id):
  light = get_light(light_id)
  light.alert = 'select'


@endpoint()
def set_brightness(light_id, brightness):
  light = get_light(light_id)
  if not light.on:
    light.on = True
  light.brightness = brightness


@endpoint()
def set_color_xy(light_id, x, y):
  light = get_light(light_id)
  if not light.on:
    light.on = True
  light.xy = [x, y]


@endpoint()
def set_color_xy_brightness(light_id, x, y, brightness):
  light = get_light(light_id)
  if not light.on:
    light.on = True
  light.xy = [x, y]
  light.brightness = brightness


@endpoint()
def rename_light(light_id, name):
  light = get_light(light_id)
  light.name = name
  alarm_light(light_id)


@endpoint()
def alarm_light(light_id):
  light = get_light(light_id)
  light.alert = 'lselect'

  def _back():
    light.alert = 'none'
  Timer(clique.ioloop(), 5, _back)


@endpoint()
def turn_light(light_id, on):
  light = get_light(light_id)
  light.on = on


def act_light(data):
  logging.debug("light action data: %s", str(data))
  try:
    ident = int(data.source_ids[0])
    act = data.action_id
    if act == 'on':
      turn_light(ident, True)
    elif act == 'off':
      turn_light(ident, False)
    elif act == 'blink':
      ping(ident)
    elif act == 'alarm':
      alarm_light(ident)
    elif act == 'random':
      set_color_xy(ident, random.random(), random.random())
    elif act == 'dim':
      set_brightness(ident, 40)
    elif act == 'full':
      set_brightness(ident, 254)
    else:
      logging.error("Invalid action: %s", act)
    return True
  except:
    logging.exception("Fail to act the lights. ident: %s, action: %s",
                      str(ident), act)


@actuators
def get_actuators():
  sources = []
  for light_data in get_lights():
    sources.append(build_source(str(light_data['ident']),
                                light_data['name'],
                                desc='Control the Light',
                                icon_uri='/ambiency/source.ico'))
  hue_actions = [['on', 'On', sources, [], 'On the Light', '/ambiency/action_on.ico'],
                 ['off', 'Off', sources, [], 'Off the Light', '/ambiency/action_off.ico'],
                 ['blink', 'Blink', sources, [], 'Blink the Light', '/ambiency/action_blink.ico'],
                 ['alarm', 'Alarm', sources, [], 'Alarm using the Light', '/ambiency/action_alarm.ico'],
                 ['random', 'Random Color', sources, [],
                  'Set the Light to random color', '/ambiency/action_random.ico'],
                 ['dim', 'Dim', sources, [], 'Dim the Light', '/ambiency/action_dim.ico'],
                 ['full', 'Full Brightness', sources, [],
                  'Set the Light to full brightness', '/ambiency/action_full.ico']]
  actions = []
  for action in hue_actions:
    actions.append(build_action(*action))
  actuators = []
  actuators.append(build_actuator('hue',
                                  'Philips Hue',
                                  actions,
                                  act_light,
                                  'Philips Hue Control Panel',
                                  '/ambiency/actuator.ico'))
  return actuators


def _get_bridge():
  bridge = clique.context('bridge')
  if not bridge:
    bridge = Bridge()
    bridge.get_ip_address(set_result=True)
    try:
      bridge.connect()
    except:
      logging.exception("Failed to connect bridge.")
      return

    clique.context('bridge', bridge)

  return bridge


def start():
  try:
    logging.debug("Boot hue app..")
    ambiency_path = os.path.join(runtime.res_dir(), 'ambiency')
    web.set_static_path(os.path.join(runtime.res_dir(), 'web'),
                        sub_path=[{'url': '/ambiency',
                                   'path': ambiency_path}])
    logging.debug("Start hue app.")
  except:
    logging.exception("Failed to start the hue.")
    raise


if __name__ == '__main__':
  start()

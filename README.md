# LED IAQ Monitor Card

Custom Home Assistant Lovelace card for [LED IAQ Monitor](https://smartnmagic.com) by Smart'n'Magic.

Displays air quality data from LED IAQ Monitor in a single card with color-coded indicators.

## Features

- AQI status with color-coded header (Excellent → Hazardous)
- CO₂, PM2.5, PM10, PM1.0, TVOC with threshold-based progress bars
- Temperature and humidity in footer
- Auto-detection of IAQ Monitor device
- Dark and light theme support

## Installation

### HACS (recommended)

1. Open HACS in Home Assistant
2. Three dots menu → **Custom repositories**
3. Add repository URL: `https://github.com/smartnmagic/led-iaq-monitor-cards`
4. Category: **Dashboard**
5. Click **Add** → find "LED IAQ Monitor Card" → **Install**
6. Refresh Home Assistant page

### Manual

1. Download `iaq-monitor-card.js` from the [latest release](https://github.com/smartnmagic/led-iaq-monitor-cards/releases)
2. Copy to `/config/www/iaq-monitor-card.js`
3. Add resource: **Settings** → **Dashboards** → **Resources** → **Add**
   - URL: `/local/iaq-monitor-card.js`
   - Type: JavaScript Module

## Configuration

Add the card to your dashboard:

```yaml
type: custom:iaq-monitor-card
```

| Option | Required | Description |
|--------|----------|-------------|
| `device_id` | No | Auto-detected. Only needed if you have multiple IAQ Monitors |
| `temp_unit` | No | Temperature unit display (default: °C) |

## Thresholds

| Metric | Excellent | Good | Moderate | Poor | Hazardous |
|--------|-----------|------|----------|------|-----------|
| CO₂ | <600 ppm | <800 | <1000 | <1500 | >1500 |
| PM2.5 | <5 µg/m³ | <15 | <25 | <50 | >50 |
| PM10 | <15 µg/m³ | <45 | <75 | <150 | >150 |
| TVOC | <100 ppb | <300 | <500 | <1000 | >1000 |

## Requirements

- Home Assistant with MQTT integration
- LED IAQ Monitor with HA integration enabled

## License

MIT

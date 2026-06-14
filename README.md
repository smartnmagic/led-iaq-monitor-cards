# LED IAQ Monitor Card

Custom Home Assistant Lovelace card for [LED IAQ Monitor](https://smartnmagic.com) by Smart'n'Magic.

Displays air quality data from LED IAQ Monitor in a single card with color-coded indicators.

## Features

- AQI status with color-coded header (Excellent → Hazardous)
- CO₂, PM2.5, PM10, PM1.0, TVOC with threshold-based progress bars
- Temperature and humidity in footer
- Dark and light theme support
- Auto-updates every 30 seconds

## Installation

### HACS (recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend** → three dots → **Custom repositories**
3. Add repository URL: `https://github.com/smartnmagic/iaq-monitor-card`
4. Category: **Plugin**
5. Click **Add** → find "LED IAQ Monitor Card" → **Install**
6. Restart Home Assistant

### Manual

1. Download `iaq-monitor-card.js` from the [latest release](https://github.com/smartnmagic/iaq-monitor-card/releases)
2. Copy to `/config/www/iaq-monitor-card.js`
3. Add resource: **Settings** → **Dashboards** → **Resources** → **Add**
   - URL: `/local/iaq-monitor-card.js`
   - Type: JavaScript Module

## Configuration

Add the card to your dashboard:

```yaml
type: custom:iaq-monitor-card
device_id: iaqmonitor_b7a8
```

| Option | Required | Description |
|--------|----------|-------------|
| `device_id` | Yes | Device hostname with `-` replaced by `_` (visible in device page URL) |

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

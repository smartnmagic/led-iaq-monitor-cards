/**
 * IAQ Monitor Card for Home Assistant
 * Custom Lovelace card for LED IAQ Monitor by Smart'n'Magic
 *
 * Installation via HACS:
 *   1. HACS → Frontend → Custom repositories
 *   2. Add: https://github.com/smartnmagic/led-iaq-monitor-cards
 *   3. Install "LED IAQ Monitor Card"
 *
 * Usage — add to dashboard:
 *   type: custom:iaq-monitor-card
 *
 * Optional config:
 *   device_id: iaqmonitor_b7a8   # only needed if multiple IAQ Monitors
 */

const AQI_LEVELS = [
  { max: 1, label: 'Excellent', color: '#22c55e', bg: '#f0fdf4' },
  { max: 2, label: 'Good',      color: '#84cc16', bg: '#f7fee7' },
  { max: 3, label: 'Moderate',  color: '#eab308', bg: '#fefce8' },
  { max: 4, label: 'Poor',      color: '#f97316', bg: '#fff7ed' },
  { max: 5, label: 'Hazardous', color: '#ef4444', bg: '#fef2f2' },
];

const METRIC_SUFFIXES = [
  { suffix: 'co2',  name: 'CO₂',   unit: 'ppm',   icon: 'mdi:molecule-co2',
    thresholds: [600, 800, 1000, 1500] },
  { suffix: 'pm25', name: 'PM2.5', unit: 'µg/m³', icon: 'mdi:blur',
    thresholds: [5, 15, 25, 50] },
  { suffix: 'pm10', name: 'PM10',  unit: 'µg/m³', icon: 'mdi:blur-linear',
    thresholds: [15, 45, 75, 150] },
  { suffix: 'pm1',  name: 'PM1.0', unit: 'µg/m³', icon: 'mdi:blur-radial',
    thresholds: [5, 15, 25, 50] },
  { suffix: 'tvoc', name: 'TVOC',  unit: 'ppb',   icon: 'mdi:air-filter',
    thresholds: [100, 300, 500, 1000] },
];

const COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

function getLevel(value, thresholds) {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return i;
  }
  return thresholds.length;
}

function getBarPercent(value, thresholds) {
  const max = thresholds[thresholds.length - 1] * 1.5;
  return Math.min(100, Math.max(2, (value / max) * 100));
}

class IaqMonitorCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._deviceId = null;
    this._rendered = false;
  }

  static getStubConfig() {
    return {};
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._deviceId) {
      this._deviceId = this._detectDevice();
    }
    if (this._deviceId) {
      this._render();
    } else {
      this._renderError();
    }
  }

  _detectDevice() {
    // If device_id is configured, use it
    if (this._config.device_id) {
      return this._config.device_id;
    }
    // Auto-detect: find first entity matching sensor.iaq_*_aqi
    const aqiEntity = Object.keys(this._hass.states)
      .find(id => id.match(/^sensor\.iaq_.*_aqi$/));
    if (aqiEntity) {
      // Extract device_id: sensor.iaq_DEVICEID_aqi → DEVICEID
      const match = aqiEntity.match(/^sensor\.iaq_(.+)_aqi$/);
      return match ? match[1] : null;
    }
    return null;
  }

  _getNumeric(suffix) {
    const id = `sensor.iaq_${this._deviceId}_${suffix}`;
    const s = this._hass.states[id];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    return parseFloat(s.state);
  }

  _renderError() {
    this.innerHTML = `
      <ha-card>
        <div style="padding:16px;color:var(--error-color)">
          IAQ Monitor not found. Check MQTT connection or set device_id manually.
        </div>
      </ha-card>`;
  }

  _render() {
    if (!this._hass || !this._deviceId) return;

    const aqi = this._getNumeric('aqi');
    const temp = this._getNumeric('temperature');
    const hum = this._getNumeric('humidity');
    const tempUnit = this._config.temp_unit || '°C';

    const aqiIdx = aqi !== null ? Math.min(Math.max(Math.round(aqi) - 1, 0), 4) : 0;
    const aqiLevel = AQI_LEVELS[aqiIdx];

    const dark = document.body.classList.contains('dark') ||
      getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-text-color')?.trim()?.startsWith('#f') ||
      getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-text-color')?.trim()?.startsWith('rgb(255');

    let metricsHtml = '';
    for (const m of METRIC_SUFFIXES) {
      const val = this._getNumeric(m.suffix);
      if (val === null) continue;
      const lvl = getLevel(val, m.thresholds);
      const color = COLORS[Math.min(lvl, 4)];
      const pct = getBarPercent(val, m.thresholds);
      metricsHtml += `
        <div class="metric-row">
          <div class="metric-label">
            <ha-icon icon="${m.icon}" style="--mdc-icon-size:18px;color:${color}"></ha-icon>
            <span>${m.name}</span>
          </div>
          <div class="metric-bar-wrap">
            <div class="metric-bar" style="width:${pct}%;background:${color}"></div>
          </div>
          <div class="metric-value">${Math.round(val)}<span class="metric-unit">${m.unit}</span></div>
        </div>`;
    }

    this.innerHTML = `
      <ha-card>
        <style>
          .iaq-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 16px 12px;
            border-radius: var(--ha-card-border-radius, 12px) var(--ha-card-border-radius, 12px) 0 0;
            background: ${dark ? this._darken(aqiLevel.color) : aqiLevel.bg};
          }
          .iaq-status {
            font-size: 16px;
            font-weight: 600;
            color: ${aqiLevel.color};
          }
          .iaq-aqi {
            display: flex;
            align-items: baseline;
            gap: 4px;
          }
          .iaq-aqi-value {
            font-size: 32px;
            font-weight: 700;
            color: ${aqiLevel.color};
            line-height: 1;
          }
          .iaq-aqi-label {
            font-size: 12px;
            color: var(--secondary-text-color);
          }
          .iaq-body { padding: 12px 16px 16px; }
          .metric-row {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 0;
          }
          .metric-label {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 80px;
            font-size: 13px;
            color: var(--primary-text-color);
          }
          .metric-bar-wrap {
            flex: 1;
            height: 6px;
            border-radius: 3px;
            background: var(--divider-color, #e5e7eb);
            overflow: hidden;
          }
          .metric-bar {
            height: 100%;
            border-radius: 3px;
            transition: width 0.5s ease;
          }
          .metric-value {
            min-width: 65px;
            text-align: right;
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-text-color);
          }
          .metric-unit {
            font-size: 11px;
            font-weight: 400;
            color: var(--secondary-text-color);
            margin-left: 2px;
          }
          .iaq-footer {
            display: flex;
            justify-content: space-around;
            padding: 12px 16px;
            border-top: 1px solid var(--divider-color, #e5e7eb);
          }
          .iaq-footer-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .iaq-footer-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--primary-text-color);
          }
          .iaq-footer-unit {
            font-size: 13px;
            color: var(--secondary-text-color);
          }
        </style>
        <div class="iaq-header">
          <div class="iaq-status">${aqi !== null ? aqiLevel.label : 'Unavailable'}</div>
          <div class="iaq-aqi">
            <div class="iaq-aqi-value">${aqi !== null ? aqi : '—'}</div>
            <div class="iaq-aqi-label">AQI</div>
          </div>
        </div>
        <div class="iaq-body">
          ${metricsHtml}
        </div>
        <div class="iaq-footer">
          <div class="iaq-footer-item">
            <ha-icon icon="mdi:thermometer" style="--mdc-icon-size:20px;color:var(--secondary-text-color)"></ha-icon>
            <span class="iaq-footer-value">${temp !== null ? temp : '—'}</span>
            <span class="iaq-footer-unit">${tempUnit}</span>
          </div>
          <div class="iaq-footer-item">
            <ha-icon icon="mdi:water-percent" style="--mdc-icon-size:20px;color:var(--secondary-text-color)"></ha-icon>
            <span class="iaq-footer-value">${hum !== null ? hum : '—'}</span>
            <span class="iaq-footer-unit">%</span>
          </div>
        </div>
      </ha-card>`;
  }

  _darken(color) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.15)`;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define('iaq-monitor-card', IaqMonitorCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'iaq-monitor-card',
  name: 'IAQ Monitor Card',
  description: 'Air quality card for LED IAQ Monitor by Smart\'n\'Magic',
  preview: true,
});

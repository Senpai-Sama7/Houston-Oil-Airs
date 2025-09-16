# Houston-Oil-Airs + EJ-AI Platform v2.0
🌮🌳 **Sensors → VR → Compensation → Policy Change**  
**Community-owned data • Dual-key encryption • GPL-3.0**

[![CI Legacy](https://github.com/Senpai-Sama7/Houston-Oil-Airs/actions/workflows/ci-legacy.yml/badge.svg)](https://github.com/Senpai-Sama7/Houston-Oil-Airs/actions)
[![CI EJ-AI](https://github.com/Senpai-Sama7/Houston-Oil-Airs/actions/workflows/ci-ej-ai-platform.yml/badge.svg)](https://github.com/Senpai-Sama7/Houston-Oil-Airs/actions)

## 🚀 Quick Start
```bash
# Install dependencies and build everything
make -f Makefile.ej-ai all

# Flash new encrypted + health sensor firmware
make -f Makefile.ej-ai flash

# Start local full stack (MQTT, Kafka, TimescaleDB, Portal)
make -f Makefile.ej-ai up

# Open community portal + VR experience
open http://localhost:3000
```

## 🎉 What's New in v2.0

### 🔐 **Dual-Key Data Governance**
- Community Advisory Board controls data exports
- Encrypted sensor signatures prevent tampering
- Residents own their environmental data

### 🥽 **Real-time 3D Pollution Plume**
- Walk inside pollution clouds on phone or VR headset
- Interactive visualization of air quality data
- WebGL-powered immersive experience

### 💰 **Micro-Payment Compensation**
- $0.01 payments to residents when air is bad
- Funded by polluter fees and environmental grants
- Smart contract automation for fair distribution

### 📊 **Enhanced Data Pipeline**
```
Legacy (v1.x)          New (v2.0)
ESP32 → CSV           ESP32 → MQTT → Kafka → TimescaleDB → Grafana
                                   ↘ VR Portal ↘ Compensation SC
```

### 🌐 **Bilingual Community Portal**
- English + Español support
- Community-controlled content
- Real-time air quality dashboard

## 🏗️ **Architecture Integration**

### **Preserved Legacy Components**
- ✅ Original ESP32 firmware (`firmware/`) - **unchanged**
- ✅ CSV data exports (`data/`) - **still works**
- ✅ Enterprise infrastructure (Kubernetes, Helm, Terraform)
- ✅ Existing CI/CD and monitoring systems

### **New EJ-AI Components**
```
platform/
├── edge/
│   ├── esp32-legacy/        ← symlink to ../firmware (your original)
│   └── esp32/              ← new encrypted + health monitoring
├── ingestion/
│   ├── csv-legacy/         ← symlink to ../data (backward compatible)
│   └── mqtt-kafka-bridge.js ← real-time data pipeline
├── community/
│   └── portal/             ← Next.js community portal + VR
├── vr/                     ← Unity WebGL pollution visualization
├── compensation/           ← micro-payment smart contracts
└── policy/                 ← policy simulation tools
```

## 🔧 **Build Options**

### **Legacy Mode** (your original system)
```bash
make -f Makefile.ej-ai flash-legacy    # Flash original firmware
# CSV files continue to work exactly as before
```

### **Enhanced Mode** (new EJ-AI features)
```bash
make -f Makefile.ej-ai flash           # Flash encrypted + health firmware
make -f Makefile.ej-ai up              # Start full platform
```

### **Hybrid Mode** (both systems running)
```bash
# Run both legacy and new sensors simultaneously
# Data flows to both CSV files AND real-time pipeline
```

## 🌐 **Community Portal Features**

### **Dashboard** (`http://localhost:3000`)
- Real-time PM2.5, PM10, temperature, humidity
- Health event tracking (inhaler clicks)
- Community health alerts
- AQI color coding and recommendations

### **VR Experience** (`/vr`)
- 3D pollution plume visualization
- Walk through contaminated areas
- Mobile and desktop VR support
- Educational pollution impact simulation

### **Compensation Panel** (`/compensation`)
- Micro-payment claims when air quality is poor
- Wallet integration for direct payments
- Compensation history and earnings tracking
- Transparent funding from polluter fees

### **Legacy Data** (`/legacy`)
- Historical CSV data visualization
- Backward compatibility with existing graphs
- Migration path from old to new system

## 🔒 **Security & Governance**

### **Dual-Key Encryption**
- **Community Key**: Controlled by Community Advisory Board
- **Device Key**: Unique per sensor for authenticity
- **Data Exports**: Require 2 CAB approvals via GitHub CODEOWNERS

### **Community Advisory Board (CAB)**
```
platform/community/    @cab-chair @org-rep
platform/compensation/ @cab-chair @org-rep
*.csv                  @cab-chair
```

### **GitHub Branch Protection**
- `community-main` branch requires CAB approval
- Raw data exports need dual signatures
- Transparent governance via GitHub issues

## 📊 **Data Pipeline**

### **Real-Time Flow**
1. **ESP32** → encrypted sensor readings
2. **MQTT** → message broker (port 1883)
3. **Kafka** → stream processing (port 9092)
4. **TimescaleDB** → time-series storage (port 5432)
5. **Grafana** → visualization (port 3001)
6. **Portal** → community interface (port 3000)

### **Legacy Compatibility**
- CSV files still generated nightly
- Existing graphs continue to work
- Gradual migration path available
- No breaking changes to current workflow

## 🧪 **Testing & Quality**

### **Automated Testing**
```bash
make -f Makefile.ej-ai test           # Run all tests
```

### **CI/CD Pipeline**
- ✅ Firmware builds (legacy + encrypted)
- ✅ Portal build and deployment
- ✅ Integration testing
- ✅ Automated releases with artifacts

### **Quality Gates**
- Firmware compilation validation
- Portal TypeScript checking
- API endpoint testing
- Docker container health checks

## 🚀 **Deployment**

### **Development**
```bash
make -f Makefile.ej-ai up             # Start all services locally
```

### **Production** (using existing infrastructure)
```bash
make -f Makefile.ej-ai deploy         # Deploy to Kubernetes
```

### **Docker Services**
- `houston-mqtt` - MQTT broker
- `houston-kafka` - Stream processing
- `houston-timescaledb` - Time-series database
- `houston-redis` - Caching layer
- `houston-ingestion` - Data pipeline
- `houston-grafana` - Monitoring dashboards

## 💡 **Usage Examples**

### **For Residents**
1. Visit `http://localhost:3000`
2. View real-time air quality
3. Experience VR pollution visualization
4. Claim compensation when air is poor
5. Participate in community governance

### **For Researchers**
1. Access TimescaleDB for analysis
2. Use Grafana for visualization
3. Export data with CAB approval
4. Contribute to policy simulations

### **For Developers**
1. Fork the repository
2. Add new sensor types
3. Extend VR visualizations
4. Improve compensation algorithms

## 🤝 **Community Governance**

### **Decision Making**
- Community Advisory Board (CAB) oversight
- GitHub issues for transparent discussion
- Dual-key approval for sensitive operations
- Regular community meetings and updates

### **Data Ownership**
- Residents own their environmental data
- Community controls export permissions
- Transparent usage and sharing policies
- Privacy protection by design

## 📈 **Roadmap**

### **Phase 1** (Current) - Platform Integration
- ✅ Dual-key encryption
- ✅ VR visualization
- ✅ Compensation system
- ✅ Community portal

### **Phase 2** (Next 3 months) - Community Expansion
- 🔄 Multi-language support (Spanish)
- 🔄 Mobile app development
- 🔄 Additional sensor types
- 🔄 Policy simulation tools

### **Phase 3** (6 months) - Scale & Impact
- 🔄 Multi-city deployment
- 🔄 Regulatory integration
- 🔄 Academic partnerships
- 🔄 Impact measurement

## 🆘 **Support & Contributing**

### **Getting Help**
- 📧 Email: [DouglasMitchell@HoustonOilAirs.org](mailto:DouglasMitchell@HoustonOilAirs.org)
- 🐛 Issues: [GitHub Issues](https://github.com/Senpai-Sama7/Houston-Oil-Airs/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Senpai-Sama7/Houston-Oil-Airs/discussions)

### **Contributing**
1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
3. Submit PRs with tests
4. Participate in community governance

## 📜 **License & Legal**

- **License**: GPL-3.0 (upgraded from MIT for community protection)
- **Data Rights**: Community-owned with dual-key governance
- **Privacy**: GDPR compliant with resident consent
- **Transparency**: All code, data, and decisions are public

---

## 🎯 **Migration Guide**

### **From v1.x to v2.0**
1. **No Breaking Changes**: Your existing setup continues to work
2. **Gradual Adoption**: Add new features incrementally
3. **Data Preservation**: All historical data is maintained
4. **Training Available**: Community workshops and documentation

### **Quick Migration**
```bash
# 1. Clone the updated repository
git pull origin main

# 2. Install new dependencies
make -f Makefile.ej-ai install

# 3. Start enhanced platform
make -f Makefile.ej-ai up

# 4. Your legacy data is automatically available at /legacy
```

---

**🎉 You just transformed a single-sensor science project into a community-run, AI-powered, cash-paying environmental-justice platform—without losing a single byte of your original work.**

---

*Original Houston-Oil-Airs documentation continues below...*
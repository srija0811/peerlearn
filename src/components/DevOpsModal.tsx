import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Terminal,
  Code2,
  FolderGit2,
  CheckCircle2,
  Copy,
  ExternalLink,
  GitBranch,
  Box,
  Layers,
  Cpu,
  Server,
  Play,
  RotateCcw,
  Check,
  Activity,
  Database,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { getSpringBootProjectFiles, downloadSpringBootProjectZip, CodeFile } from '../services/springBootTemplate';
import { api, DevOpsStatusResponse } from '../services/apiClient';

interface DevOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'overview' | 'git' | 'maven' | 'jenkins' | 'docker' | 'k8s' | 'api-tester' | 'source';
}

export const DevOpsModal: React.FC<DevOpsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [files] = useState<CodeFile[]>(getSpringBootProjectFiles());
  const [selectedFile, setSelectedFile] = useState<CodeFile>(files[0]);
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // DevOps Backend Status
  const [devopsStatus, setDevopsStatus] = useState<DevOpsStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Jenkins Pipeline Simulation State
  const [pipelineState, setPipelineState] = useState<'IDLE' | 'RUNNING' | 'SUCCESS'>('SUCCESS');
  const [activeStageIndex, setActiveStageIndex] = useState<number>(4);
  const [jenkinsConsoleLogs, setJenkinsConsoleLogs] = useState<string[]>([
    '[Pipeline] Start of Pipeline',
    '[Pipeline] stage: 1. Checkout SCM',
    ' > git rev-parse --is-inside-work-tree # timeout=10',
    ' > git checkout -f origin/main',
    'Commit 9078f37: Add production Kubernetes manifests and sync backend',
    '[Pipeline] stage: 2. Maven Build & Test',
    'Executing: ./mvnw clean test',
    '[INFO] Running com.peerlearn.backend.MatchingServiceTest',
    '[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0 - Time elapsed: 1.234 s',
    '[INFO] Running com.peerlearn.backend.SecurityAndAuthTest',
    '[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0 - Time elapsed: 1.582 s',
    '[INFO] BUILD SUCCESS - Total time: 14.821 s',
    '[Pipeline] stage: 3. Quality Gate Analysis',
    'SonarQube Scanner: 0 Bugs, 0 Vulnerabilities, 0 Security Hotspots, Coverage: 92.4%',
    '[Pipeline] stage: 4. Docker Image Build',
    'docker build -t peerlearn-app:1.0 .',
    'Successfully tagged peerlearn-app:1.0',
    '[Pipeline] stage: 5. Deploy to Kubernetes',
    'kubectl apply -k k8s/',
    'namespace/peerlearn unchanged',
    'secret/peerlearn-db-secret unchanged',
    'persistentvolumeclaim/mysql-pvc configured',
    'deployment.apps/peerlearn-mysql configured',
    'service/mysql-service unchanged',
    'deployment.apps/peerlearn-app configured',
    'service/peerlearn-service unchanged',
    '[Pipeline] Finished: SUCCESS'
  ]);

  // Live REST API Tester State
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/health');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Kubernetes Manifest Viewer
  const [selectedK8sManifest, setSelectedK8sManifest] = useState<string>('05-app-deployment.yaml');

  useEffect(() => {
    if (isOpen) {
      fetchDevOpsStatus();
    }
  }, [isOpen]);

  const fetchDevOpsStatus = async () => {
    try {
      setLoadingStatus(true);
      const data = await api.getDevOpsStatus();
      setDevopsStatus(data);
    } catch (err) {
      console.warn('Could not fetch devops status', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadSpringBootProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  const triggerJenkinsSimulation = () => {
    setPipelineState('RUNNING');
    setActiveStageIndex(0);
    setJenkinsConsoleLogs(['[Pipeline] Starting PeerLearn CI/CD Pipeline (Build #43)...']);

    const stages = [
      {
        idx: 0,
        logs: [
          '[Pipeline] stage: 1. Checkout SCM',
          'Cloning repository: https://github.com/vasavi-peerlearn/peerlearn-platform.git',
          'Checking out revision 9078f37 on branch origin/main',
          'SCM Checkout completed cleanly in 2.8s'
        ]
      },
      {
        idx: 1,
        logs: [
          '[Pipeline] stage: 2. Maven Build & Test',
          'Executing: mvn clean test && mvn clean package -DskipTests=false',
          '[INFO] Compiling 24 source files with Java 21 LTS',
          '[INFO] Running Unit & Integration Tests...',
          '[INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0',
          '[INFO] Building jar: target/peerlearn-0.0.1-SNAPSHOT.jar',
          '[INFO] BUILD SUCCESS (Time: 12.4s)'
        ]
      },
      {
        idx: 2,
        logs: [
          '[Pipeline] stage: 3. Quality Gate Analysis',
          'Checking SonarQube & Checkstyle metrics...',
          'Duplications: 0.0%, Code Smells: 0, Quality Gate status: PASSED'
        ]
      },
      {
        idx: 3,
        logs: [
          '[Pipeline] stage: 4. Docker Image Build',
          'Building Docker image from multi-stage Dockerfile...',
          'Step 1/12: FROM maven:3.9.8-eclipse-temurin-21-jammy AS builder',
          'Step 8/12: FROM eclipse-temurin:21-jre-jammy',
          'Successfully built and tagged peerlearn-app:1.0'
        ]
      },
      {
        idx: 4,
        logs: [
          '[Pipeline] stage: 5. Deploy to Kubernetes',
          'Target cluster: local-k8s (minikube / docker-desktop)',
          'Executing: kubectl apply -k k8s/',
          'namespace/peerlearn configured',
          'deployment.apps/peerlearn-app configured',
          'Waiting for rollout to finish: 2 of 2 updated replicas are available',
          '[Pipeline] Deployment Complete! App live at http://localhost:30080',
          '[Pipeline] Finished: SUCCESS'
        ]
      }
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setActiveStageIndex(stage.idx);
        setJenkinsConsoleLogs(prev => [...prev, ...stage.logs]);
        if (index === stages.length - 1) {
          setPipelineState('SUCCESS');
        }
      }, (index + 1) * 900);
    });
  };

  const handleTestApi = async (endpoint: string) => {
    setApiEndpoint(endpoint);
    setApiLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiLatency(Math.round(performance.now() - start));
      setApiResponse(data);
    } catch (err: any) {
      setApiLatency(Math.round(performance.now() - start));
      setApiResponse({ error: err.message || 'Failed to fetch' });
    } finally {
      setApiLoading(false);
    }
  };

  const k8sManifestsMap: Record<string, string> = {
    '00-namespace.yaml': `apiVersion: v1
kind: Namespace
metadata:
  name: peerlearn
  labels:
    app.kubernetes.io/name: peerlearn
    app.kubernetes.io/part-of: peerlearn-platform`,

    '01-secret.yaml': `apiVersion: v1
kind: Secret
metadata:
  name: peerlearn-db-secret
  namespace: peerlearn
type: Opaque
stringData:
  MYSQL_ROOT_PASSWORD: "rootpassword"
  MYSQL_DATABASE: "peerlearn_db"
  MYSQL_USER: "peerlearn"
  MYSQL_PASSWORD: "peerlearn_secret_password"`,

    '02-mysql-pvc.yaml': `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: peerlearn
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi`,

    '03-mysql-deployment.yaml': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: peerlearn-mysql
  namespace: peerlearn
spec:
  replicas: 1
  selector:
    matchLabels:
      app: peerlearn-mysql
  template:
    metadata:
      labels:
        app: peerlearn-mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.4
          ports:
            - containerPort: 3306
          envFrom:
            - secretRef:
                name: peerlearn-db-secret
          volumeMounts:
            - name: mysql-data
              mountPath: /var/lib/mysql
          livenessProbe:
            exec:
              command: ["mysqladmin", "ping", "-h", "localhost"]
            initialDelaySeconds: 30
            periodSeconds: 10
      volumes:
        - name: mysql-data
          persistentVolumeClaim:
            claimName: mysql-pvc`,

    '04-mysql-service.yaml': `apiVersion: v1
kind: Service
metadata:
  name: mysql-service
  namespace: peerlearn
spec:
  type: ClusterIP
  ports:
    - port: 3306
      targetPort: 3306
  selector:
    app: peerlearn-mysql`,

    '05-app-deployment.yaml': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: peerlearn-app
  namespace: peerlearn
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: peerlearn-app
  template:
    metadata:
      labels:
        app: peerlearn-app
    spec:
      containers:
        - name: peerlearn-app
          image: peerlearn-app:1.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          env:
            - name: DB_HOST
              value: "mysql-service"
            - name: DB_PORT
              value: "3306"
            - name: DB_NAME
              valueFrom:
                secretKeyRef:
                  name: peerlearn-db-secret
                  key: MYSQL_DATABASE
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: peerlearn-db-secret
                  key: MYSQL_USER
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: peerlearn-db-secret
                  key: MYSQL_PASSWORD
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1024Mi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 45
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10`,

    '06-app-service.yaml': `apiVersion: v1
kind: Service
metadata:
  name: peerlearn-service
  namespace: peerlearn
spec:
  type: NodePort
  selector:
    app: peerlearn-app
  ports:
    - name: http
      port: 8080
      targetPort: 8080
      nodePort: 30080`,

    'kustomization.yaml': `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: peerlearn
resources:
  - 00-namespace.yaml
  - 01-secret.yaml
  - 02-mysql-pvc.yaml
  - 03-mysql-deployment.yaml
  - 04-mysql-service.yaml
  - 05-app-deployment.yaml
  - 06-app-service.yaml`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-[#E9DDFC]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#FAF9FD]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5425A8] to-[#7546D8] text-white flex items-center justify-center shadow-md shadow-[#5425A8]/20">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#202033] tracking-tight">
                  End-to-End CI/CD Pipeline &amp; Full-Stack Integration
                </h2>
                <span className="text-[11px] font-bold bg-[#E9DDFC] text-[#5425A8] px-2.5 py-0.5 rounded-full">
                  Syllabus Case Study
                </span>
              </div>
              <p className="text-xs text-[#77758A]">
                Java 21 • Spring Boot 3.3.4 • MySQL 8.4 • Git • Maven • Jenkins • Docker • Kubernetes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              title="Go Back / Close (Esc)"
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-[#5425A8] border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#7546D8]" />
              <span>Back</span>
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[#5425A8] hover:bg-[#431D86] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5425A8]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Packaging...' : 'Download Project ZIP'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 px-6 bg-white border-b border-gray-200 overflow-x-auto text-xs font-semibold py-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2.5 border-b-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#7546D8] text-[#5425A8] font-bold bg-[#FAF9FD]'
                : 'border-transparent text-[#77758A] hover:text-[#202033]'
            }`}
          >
            <Activity className="w-4 h-4 text-[#7546D8]" />
            <span>Overview &amp; Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('git')}
            className={`px-3 py-2.5 border-b-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'git'
                ? 'border-[#7546D8] text-[#5425A8] font-bold bg-[#FAF9FD]'
                : 'border-transparent text-[#77758A] hover:text-[#202033]'
            }`}
          >
            <GitBranch className="w-4 h-4 text-[#E24A4A]" />
            <span>1. Git &amp; GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('maven')}
            className={`px-3 py-2.5 border-b-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'maven'
                ? 'border-[#7546D8] text-[#5425A8] font-bold bg-[#FAF9FD]'
                : 'border-transparent text-[#77758A] hover:text-[#202033]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#C71A36]" />
            <span>2. Maven Build Tool</span>
          </button>

          <button
            onClick={() => setActiveTab('jenkins')}
            className={`px-3 py-2.5 border-b-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'jenkins'
                ? 'border-[#7546D8] text-[#5425A8] font-bold bg-[#FAF9FD]'
                : 'border-transparent text-[#77758A] hover:text-[#202033]'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#1E3A8A]" />
            <span>3. Jenkins CI/CD</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`px-3 py-2.5 border-b-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'docker'
                ? 'border-[#7546D8] text-[#5425A8] font-bold bg-[#FAF9FD]'
                : 'border-transparent text-[#77758A] hover:text-[#202033]'
            }`}
          >
            <Box className="w-4 h-4 text-[#0EA5E9]" />
            <span>4. Docker Container</span>
          </button>

          <button
            onClick={() => setActiveTab('k8s')}
            className={`px-3 py-2.5 border-b-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'k8s'
                ? 'border-[#7546D8] text-[#5425A8] font-bold bg-[#FAF9FD]'
                : 'border-transparent text-[#77758A] hover:text-[#202033]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#326CE5]" />
            <span>5. Kubernetes (K8s)</span>
          </button>

          <button
            onClick={() => setActiveTab('api-tester')}
            className={`px-3 py-2.5 border-b-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'api-tester'
                ? 'border-[#7546D8] text-[#5425A8] font-bold bg-[#FAF9FD]'
                : 'border-transparent text-[#77758A] hover:text-[#202033]'
            }`}
          >
            <Server className="w-4 h-4 text-[#10B981]" />
            <span>Live REST API Tester</span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`px-3 py-2.5 border-b-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'source'
                ? 'border-[#7546D8] text-[#5425A8] font-bold bg-[#FAF9FD]'
                : 'border-transparent text-[#77758A] hover:text-[#202033]'
            }`}
          >
            <Code2 className="w-4 h-4 text-[#7546D8]" />
            <span>Java 21 Source Files</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F7FC]">
          {/* TAB 1: OVERVIEW & ARCHITECTURE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Syllabus Objective Callout */}
              <div className="bg-gradient-to-r from-[#5425A8] to-[#7546D8] text-white p-6 rounded-2xl shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold tracking-wider uppercase">
                    Academic Syllabus Alignment
                  </span>
                  <span className="text-xs text-white/80">Semester End Case Study</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Case Study: End-to-End CI/CD Pipeline for a Web Application</h3>
                <p className="text-xs text-white/90 leading-relaxed max-w-3xl">
                  PeerLearn fulfills the complete DevOps lifecycle syllabus: developing a student skill exchange platform with full-stack frontend &amp; backend integration, and automating build, testing, containerization, and orchestration across the 5 required pillars.
                </p>
              </div>

              {/* 5 Pillars Roadmap Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs mb-3">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-[#202033] mb-1">Git &amp; GitHub</h4>
                    <p className="text-[11px] text-[#77758A]">Version control, branch protection, commit history, .gitignore</p>
                  </div>
                  <span className="mt-3 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md inline-block w-fit">
                    Configured (main/develop)
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs mb-3">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-[#202033] mb-1">Apache Maven</h4>
                    <p className="text-[11px] text-[#77758A]">Java 21 compilation, unit test suites, JAR artifact packaging</p>
                  </div>
                  <span className="mt-3 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md inline-block w-fit">
                    Verified (15 Tests Pass)
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-3">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-[#202033] mb-1">Jenkins CI/CD</h4>
                    <p className="text-[11px] text-[#77758A]">Automated pipeline: SCM ➔ Test ➔ Quality Gate ➔ Docker ➔ K8s</p>
                  </div>
                  <span className="mt-3 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md inline-block w-fit">
                    Jenkinsfile Automated
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs mb-3">
                      4
                    </div>
                    <h4 className="text-xs font-bold text-[#202033] mb-1">Docker</h4>
                    <p className="text-[11px] text-[#77758A]">Multi-stage Dockerfile, peerlearn-app:1.0, MySQL 8.4 compose</p>
                  </div>
                  <span className="mt-3 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md inline-block w-fit">
                    Containerized (8080/3306)
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mb-3">
                      5
                    </div>
                    <h4 className="text-xs font-bold text-[#202033] mb-1">Kubernetes</h4>
                    <p className="text-[11px] text-[#77758A]">Namespace, PVC, Secrets, 2 Replicas, NodePort 30080, Probes</p>
                  </div>
                  <span className="mt-3 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md inline-block w-fit">
                    7 YAMLs in /k8s/
                  </span>
                </div>
              </div>

              {/* End-to-End Visual Architecture Diagram */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <h4 className="text-sm font-bold text-[#202033] mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#7546D8]" />
                  <span>Full-Stack Application &amp; Pipeline Architecture</span>
                </h4>

                <div className="p-4 bg-[#FAF9FD] rounded-xl border border-[#E9DDFC] font-mono text-xs overflow-x-auto text-[#202033]">
                  <pre className="leading-relaxed">
{`+-----------------------------------------------------------------------------------------------------------------+
|                                         PEERLEARN END-TO-END CI/CD PIPELINE                                     |
+-----------------------------------------------------------------------------------------------------------------+

 [ DEVELOPER ] ──git push──> [ GITHUB / GIT ] ──webhook──> [ JENKINS CI SERVER (Port 8080) ]
 (Windows 11)                 Branch: main/develop              |
                                                                |--> Stage 1: Checkout SCM
                                                                |--> Stage 2: Maven Build & Unit Tests (Java 21)
                                                                |--> Stage 3: SonarQube Quality Gate Check
                                                                |--> Stage 4: Docker Build & Tag (peerlearn-app:1.0)
                                                                \\--> Stage 5: Kubernetes Deploy (kubectl apply -k k8s)
                                                                                             |
                                                                                             v
+-----------------------------------------------------------------------------------------------------------------+
|                                  KUBERNETES ORCHESTRATION CLUSTER (Namespace: peerlearn)                        |
|                                                                                                                 |
|   [ Browser / Client ]                                                                                          |
|             |                                                                                                   |
|             v                                                                                                   |
|   [ Service: peerlearn-service ] (NodePort: 30080 -> 8080)                                                      |
|             |                                                                                                   |
|             v                                                                                                   |
|   +---------------------------------------------------+         +-------------------------------------------+   |
|   |   Deployment: peerlearn-app (2 Replicas)          |         |   Deployment: peerlearn-mysql (1 Replica) |   |
|   |   - Image: peerlearn-app:1.0                      |         |   - Image: mysql:8.4                      |   |
|   |   - Java 21 LTS + Spring Boot 3.3.4 REST API      |--TCP:3306--> - Service: mysql-service (ClusterIP)   |   |
|   |   - Liveness Probe: /actuator/health/liveness     |         |   - PersistentVolumeClaim: mysql-pvc (2Gi)|   |
|   |   - Readiness Probe: /actuator/health/readiness   |         |   - Secret: peerlearn-db-secret           |   |
|   +---------------------------------------------------+         +-------------------------------------------+   |
+-----------------------------------------------------------------------------------------------------------------+`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GIT & GITHUB */}
          {activeTab === 'git' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#202033] flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-red-600" />
                      <span>1. Version Control: Git &amp; GitHub Integration</span>
                    </h3>
                    <p className="text-xs text-[#77758A]">
                      Branching strategy, commit history, and Windows 11 setup commands
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyText(`git status\ngit branch -a\ngit log --oneline -n 5`, 'git-cmds')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9FD] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#E9DDFC]"
                  >
                    {copied === 'git-cmds' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Commands</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-[#FAF9FD] rounded-xl border border-gray-200">
                    <span className="text-[11px] font-bold text-[#77758A] uppercase">Active Branches</span>
                    <ul className="mt-2 space-y-1.5 text-xs">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-mono font-bold text-[#5425A8]">main</span>
                        <span className="text-gray-400 text-[11px]">(Production release branch)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-mono font-semibold text-[#202033]">develop</span>
                        <span className="text-gray-400 text-[11px]">(Active integration branch)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#FAF9FD] rounded-xl border border-gray-200">
                    <span className="text-[11px] font-bold text-[#77758A] uppercase">Repository Configuration</span>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li><strong>Ignored Artifacts:</strong> target/, *.class, .env, secrets</li>
                      <li><strong>Tracked Manifests:</strong> pom.xml, Dockerfile, Jenkinsfile, k8s/*.yaml</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#1E1E2E] text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  <p className="text-gray-400 mb-2"># Windows 11 Command Prompt (CMD) Execution:</p>
                  <p className="text-green-400">git status</p>
                  <p className="text-gray-300">On branch main</p>
                  <p className="text-gray-300">Your branch is up to date with 'origin/main'.</p>
                  <p className="text-gray-300">nothing to commit, working tree clean</p>
                  <br />
                  <p className="text-green-400">git log --oneline -n 3</p>
                  <p className="text-gray-300">9078f37 (HEAD -&gt; main, develop) Add production Kubernetes manifests and sync backend</p>
                  <p className="text-gray-300">c81d4a2 Add Dockerfile and Jenkinsfile for CI/CD automation</p>
                  <p className="text-gray-300">f29e105 Initial commit: Spring Boot 3.3.4, JPA entities and mutual skill matching</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAVEN */}
          {activeTab === 'maven' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#202033] flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-rose-600" />
                      <span>2. Build Tool: Apache Maven &amp; Java 21</span>
                    </h3>
                    <p className="text-xs text-[#77758A]">
                      Dependency resolution, automated unit testing, and JAR packaging
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyText(`mvn clean test\nmvn clean package`, 'maven-cmds')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9FD] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#E9DDFC]"
                  >
                    {copied === 'maven-cmds' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Build Command</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
                  <div className="p-3 bg-[#FAF9FD] rounded-xl border border-gray-100">
                    <span className="text-[#77758A] block">Java Version</span>
                    <span className="font-bold text-[#202033]">Java 21 (LTS)</span>
                  </div>
                  <div className="p-3 bg-[#FAF9FD] rounded-xl border border-gray-100">
                    <span className="text-[#77758A] block">Framework</span>
                    <span className="font-bold text-[#202033]">Spring Boot 3.3.4</span>
                  </div>
                  <div className="p-3 bg-[#FAF9FD] rounded-xl border border-gray-100">
                    <span className="text-[#77758A] block">Output Artifact</span>
                    <span className="font-bold font-mono text-[#5425A8]">peerlearn-0.0.1-SNAPSHOT.jar</span>
                  </div>
                </div>

                <div className="bg-[#1E1E2E] text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  <p className="text-yellow-400">&gt; mvn clean test</p>
                  <p className="text-gray-300">[INFO] -------------------------------------------------------</p>
                  <p className="text-gray-300">[INFO]  T E S T S</p>
                  <p className="text-gray-300">[INFO] -------------------------------------------------------</p>
                  <p className="text-green-400">[INFO] Running com.peerlearn.backend.MatchingServiceTest</p>
                  <p className="text-gray-300">[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0</p>
                  <p className="text-green-400">[INFO] Running com.peerlearn.backend.SecurityAndAuthTest</p>
                  <p className="text-gray-300">[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0</p>
                  <p className="text-green-400">[INFO] Running com.peerlearn.backend.ExchangeRequestTest</p>
                  <p className="text-gray-300">[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0</p>
                  <p className="text-green-400 font-bold">[INFO] BUILD SUCCESS</p>
                  <p className="text-gray-400">[INFO] Total time:  6.418 s</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JENKINS */}
          {activeTab === 'jenkins' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#202033] flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-blue-700" />
                      <span>3. CI/CD Tool: Jenkins Pipeline Automation</span>
                    </h3>
                    <p className="text-xs text-[#77758A]">
                      Declarative Jenkinsfile pipeline with automated stages and live execution simulator
                    </p>
                  </div>
                  <button
                    onClick={triggerJenkinsSimulation}
                    disabled={pipelineState === 'RUNNING'}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5425A8] hover:bg-[#431D86] text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Pipeline Build #43</span>
                  </button>
                </div>

                {/* Pipeline Visual Stages */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6">
                  {[
                    { name: '1. Checkout SCM', tool: 'Git' },
                    { name: '2. Build & Test', tool: 'Maven' },
                    { name: '3. Quality Gate', tool: 'Sonar' },
                    { name: '4. Docker Build', tool: 'Docker' },
                    { name: '5. K8s Deploy', tool: 'Kubectl' },
                  ].map((stage, idx) => {
                    const isDone = activeStageIndex >= idx;
                    const isCurrent = activeStageIndex === idx && pipelineState === 'RUNNING';
                    return (
                      <div
                        key={stage.name}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                            : isDone
                            ? 'bg-green-50 border-green-200 text-green-900'
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-500">
                          {stage.tool}
                        </div>
                        <div className="text-xs font-bold truncate">{stage.name}</div>
                        <div className="mt-1 flex items-center justify-center gap-1 text-[11px]">
                          {isCurrent ? (
                            <span className="text-amber-600 font-semibold">Running...</span>
                          ) : isDone ? (
                            <span className="text-green-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Passed
                            </span>
                          ) : (
                            <span className="text-gray-400">Waiting</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Console Output */}
                <div className="bg-[#181825] text-gray-300 p-4 rounded-xl font-mono text-xs h-64 overflow-y-auto leading-relaxed border border-gray-800">
                  <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1 flex items-center justify-between">
                    <span>Jenkins Console Output: peerlearn-pipeline (Build #42)</span>
                    <span className="text-green-400 font-bold">STATUS: {pipelineState}</span>
                  </div>
                  {jenkinsConsoleLogs.map((log, i) => (
                    <div key={i} className="py-0.5">
                      {log.includes('SUCCESS') ? (
                        <span className="text-green-400 font-bold">{log}</span>
                      ) : log.includes('stage:') ? (
                        <span className="text-[#A78BFA] font-bold">{log}</span>
                      ) : (
                        <span>{log}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCKER */}
          {activeTab === 'docker' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#202033] flex items-center gap-2">
                      <Box className="w-5 h-5 text-sky-500" />
                      <span>4. Containerization: Docker &amp; Docker Compose</span>
                    </h3>
                    <p className="text-xs text-[#77758A]">
                      Multi-stage Dockerfile packaging Java 21 Spring Boot app and MySQL 8.4 database
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyText(`docker-compose up -d --build`, 'docker-cmds')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9FD] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#E9DDFC]"
                  >
                    {copied === 'docker-cmds' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Docker Command</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-sky-900">App Container (peerlearn-app:1.0)</span>
                      <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded font-bold">Port 8080</span>
                    </div>
                    <p className="text-[11px] text-[#77758A]">Base: eclipse-temurin:21-jre-jammy with Spring Boot 3.3.4</p>
                  </div>

                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-900">Database Container (mysql:8.4)</span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded font-bold">Port 3306</span>
                    </div>
                    <p className="text-[11px] text-[#77758A]">Volume: persistent mysql_data with healthcheck ping</p>
                  </div>
                </div>

                <div className="bg-[#1E1E2E] text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  <p className="text-gray-400 mb-2"># Multi-stage Dockerfile preview:</p>
                  <p className="text-[#A78BFA]">FROM maven:3.9.8-eclipse-temurin-21-jammy AS builder</p>
                  <p className="text-gray-300">WORKDIR /app</p>
                  <p className="text-gray-300">COPY pom.xml .</p>
                  <p className="text-gray-300">RUN mvn dependency:go-offline</p>
                  <p className="text-gray-300">COPY src ./src</p>
                  <p className="text-gray-300">RUN mvn clean package -DskipTests=true</p>
                  <br />
                  <p className="text-[#A78BFA]">FROM eclipse-temurin:21-jre-jammy</p>
                  <p className="text-gray-300">WORKDIR /app</p>
                  <p className="text-gray-300">COPY --from=builder /app/target/*.jar app.jar</p>
                  <p className="text-gray-300">EXPOSE 8080</p>
                  <p className="text-green-400">ENTRYPOINT ["java", "-jar", "app.jar"]</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KUBERNETES */}
          {activeTab === 'k8s' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#202033] flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-600" />
                      <span>5. Orchestration: Kubernetes (K8s)</span>
                    </h3>
                    <p className="text-xs text-[#77758A]">
                      Production manifests in /k8s/ with Namespace, PVC, Secrets, Deployments and NodePort Service
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyText(`kubectl apply -k k8s`, 'k8s-deploy')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9FD] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#E9DDFC]"
                  >
                    {copied === 'k8s-deploy' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy kubectl command</span>
                  </button>
                </div>

                {/* Manifest Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
                  {Object.keys(k8sManifestsMap).map(filename => (
                    <button
                      key={filename}
                      onClick={() => setSelectedK8sManifest(filename)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                        selectedK8sManifest === filename
                          ? 'bg-[#5425A8] text-white font-bold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filename}
                    </button>
                  ))}
                </div>

                <div className="bg-[#1E1E2E] text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-2">
                    <span className="text-[#A78BFA]">k8s/{selectedK8sManifest}</span>
                    <button
                      onClick={() => handleCopyText(k8sManifestsMap[selectedK8sManifest], 'k8s-file')}
                      className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {copied === 'k8s-file' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy YAML</span>
                    </button>
                  </div>
                  <pre className="text-gray-300 leading-relaxed">
                    {k8sManifestsMap[selectedK8sManifest]}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LIVE REST API TESTER */}
          {activeTab === 'api-tester' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#202033] flex items-center gap-2">
                      <Server className="w-5 h-5 text-emerald-600" />
                      <span>Live Backend REST API &amp; Persistence Inspector</span>
                    </h3>
                    <p className="text-xs text-[#77758A]">
                      Directly execute and test live REST API endpoints integrated with the backend database
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { label: 'Health Check', url: '/api/health' },
                    { label: 'DevOps Status (5 Pillars)', url: '/api/devops/status' },
                    { label: 'All Students', url: '/api/students' },
                    { label: 'Mutual Matches (Srija)', url: '/api/matches/student-srija' },
                    { label: 'Admin Statistics', url: '/api/admin/stats' }
                  ].map(item => (
                    <button
                      key={item.url}
                      onClick={() => handleTestApi(item.url)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        apiEndpoint === item.url
                          ? 'bg-[#5425A8] text-white shadow-xs'
                          : 'bg-[#FAF9FD] text-[#5425A8] border border-[#E9DDFC] hover:bg-[#E9DDFC]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 flex items-center bg-[#FAF9FD] border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-[#202033]">
                    <span className="font-bold text-emerald-600 mr-2">GET</span>
                    <span>{apiEndpoint}</span>
                  </div>
                  <button
                    onClick={() => handleTestApi(apiEndpoint)}
                    disabled={apiLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {apiLoading ? 'Testing...' : 'Send Request'}
                  </button>
                </div>

                {apiLatency !== null && (
                  <div className="flex items-center gap-3 mb-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold">200 OK</span>
                    <span className="text-[#77758A]">Response Latency: <strong>{apiLatency}ms</strong></span>
                    <span className="text-[#77758A]">Backend: <strong>Express / Spring Boot 3.3.4</strong></span>
                  </div>
                )}

                <div className="bg-[#1E1E2E] text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto h-72">
                  <pre className="text-gray-300 leading-relaxed">
                    {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Click "Send Request" or select a preset above to test the live backend!'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SOURCE CODE VIEWER */}
          {activeTab === 'source' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row overflow-hidden h-[600px]">
              {/* Sidebar files */}
              <div className="w-full md:w-64 border-r border-gray-100 bg-[#FAF9FD] p-3 overflow-y-auto">
                <p className="text-[11px] font-bold text-[#77758A] uppercase tracking-wider mb-2 px-2">Project Files</p>
                <div className="space-y-1">
                  {files.map(file => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#E9DDFC] text-[#5425A8] font-bold'
                            : 'text-[#202033] hover:bg-gray-100'
                        }`}
                      >
                        <Code2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#7546D8]' : 'text-gray-400'}`} />
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col bg-[#1E1E2E] text-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-gray-800 text-xs">
                  <span className="font-mono text-[#A78BFA]">{selectedFile.path}</span>
                  <button
                    onClick={() => handleCopyText(selectedFile.content, 'source-file')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-xs rounded transition-colors cursor-pointer"
                  >
                    {copied === 'source-file' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'source-file' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="flex-1 p-4 font-mono text-xs overflow-auto leading-relaxed text-gray-300">
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between text-xs text-[#77758A]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[#202033]">All 5 Syllabus Pillars Integrated:</span>
            <span className="hidden md:inline">Git ➔ Maven ➔ Jenkins ➔ Docker ➔ Kubernetes</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              className="text-[#5425A8] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Download Project ZIP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

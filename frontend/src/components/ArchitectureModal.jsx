import React from "react";
import { useBank } from "../context/BankContext";
import {
  X,
  Layers,
  Server,
  Database,
  Radio,
  Mail,
  Shield,
  CreditCard,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export const ArchitectureModal = ({ isOpen, onClose }) => {
  const { systemHealth, checkHealth } = useBank();

  if (!isOpen) return null;

  const services = [
    {
      id: "gateway",
      name: "API Gateway",
      port: 8080,
      icon: Layers,
      color: "from-emerald-500 to-cyan-500",
      desc: "Reverse proxy, X-Correlation-ID tracing, and /internal/* security filtering",
      status: systemHealth?.status === "UP" ? "UP" : "UNKNOWN",
    },
    {
      id: "auth",
      name: "Auth Service",
      port: 5001,
      icon: Shield,
      color: "from-indigo-500 to-purple-600",
      desc: "Identity & JWT issuance, 6-digit OTP in Redis (TTL 300s)",
      status: "UP",
    },
    {
      id: "account",
      name: "Account Service",
      port: 5002,
      icon: CreditCard,
      color: "from-blue-500 to-cyan-600",
      desc: "Bank account management, currency support, internal status validation",
      status: "UP",
    },
    {
      id: "transaction",
      name: "Transaction & Ledger",
      port: 5003,
      icon: Server,
      color: "from-amber-500 to-orange-600",
      desc: "Append-only double-entry ledger, dynamic aggregation, Redis mutex lock",
      status: "UP",
    },
    {
      id: "notification",
      name: "Notification Worker",
      port: 5004,
      icon: Mail,
      color: "from-rose-500 to-pink-600",
      desc: "RabbitMQ consumer (mail_queue, mail_retry_queue, mail_dlq), Gmail OAuth2",
      status: "UP",
    },
  ];

  const infrastructure = [
    {
      name: "MongoDB Atlas",
      type: "Database-per-Service",
      dbs: "bank_auth, bank_account, bank_transaction",
      status: "CONNECTED",
      color: "text-emerald-400",
    },
    {
      name: "Upstash Redis",
      type: "In-Memory Cache & Mutex",
      dbs: "login_otp:<id>, transaction:<idempotencyKey>",
      status: "CONNECTED",
      color: "text-rose-400",
    },
    {
      name: "CloudAMQP RabbitMQ",
      type: "Message Broker",
      dbs: "Topic Exchange (bank_events), mail_queue, DLQ",
      status: "CONNECTED",
      color: "text-amber-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 glow-cyan">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Live Microservices Topology & Mesh
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Decoupled Architecture with Database-per-Service Isolation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={checkHealth}
              title="Ping Services"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Visual Diagram & Microservices Grid */}
        <div className="mt-6 space-y-6">
          {/* Microservices Nodes */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3 font-bold">
              Core Microservices (HTTP & REST)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {services.map((srv) => {
                const IconComponent = srv.icon;
                return (
                  <div
                    key={srv.id}
                    className="p-4 rounded-xl glass-card border border-gray-800 hover:border-gray-700 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1.5 rounded-lg bg-gradient-to-br ${srv.color} text-white shadow-sm`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-white">{srv.name}</span>
                      </div>
                      <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>:{srv.port}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">{srv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cloud Infrastructure Grid */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3 font-bold">
              Cloud Storage & Event Messaging Infrastructure
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {infrastructure.map((infra) => (
                <div
                  key={infra.name}
                  className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${infra.color}`}>{infra.name}</span>
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {infra.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-300 font-medium block mt-1">
                      {infra.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mt-3 bg-black/40 p-2 rounded border border-white/5">
                    {infra.dbs}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sequence summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-gray-900/50 to-cyan-950/30 border border-emerald-500/20 text-xs font-mono text-gray-300 space-y-1">
            <div className="text-emerald-400 font-bold mb-1">
              ⚡ Double-Entry Concurrency Guarantees:
            </div>
            <div>1. Client UUID Idempotency Key deduplication (prevents duplicate API execution).</div>
            <div>2. Redis Distributed Mutex Lock (<code className="text-amber-300">SET NX PX</code>) prevents double-spending during in-flight transfers.</div>
            <div>3. Dynamic Balance calculation over immutable ledger lines eliminates state drift.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

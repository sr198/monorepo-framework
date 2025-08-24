import React, { useEffect } from 'react';
import { useTicketStore } from '../stores/ticketStore';
import { Ticket } from '../services/api';

export const TicketList: React.FC = () => {
  const { tickets, loading, error, fetchTickets, clearError } =
    useTicketStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      case 'neutral':
        return '😐';
      default:
        return '🤖';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'technical_issue':
        return '🔧';
      case 'billing_inquiry':
        return '💰';
      case 'feature_request':
        return '✨';
      case 'complaint':
        return '😤';
      case 'compliment':
        return '👏';
      default:
        return '📋';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading tickets
            </h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <button
              onClick={() => {
                clearError();
                fetchTickets();
              }}
              className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎫</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tickets yet
        </h3>
        <p className="text-gray-600">
          Create your first ticket to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Recent Tickets</h2>
        <button
          onClick={fetchTickets}
          disabled={loading}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          {loading ? '🔄' : '↻'} Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket: Ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {ticket.title}
                </h3>
                <p className="text-sm text-gray-600">#{ticket.id}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 line-clamp-2">
              {ticket.description}
            </p>

            {/* AI Analysis */}
            {ticket.ai_analysis && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">🤖</span>
                  <h4 className="text-sm font-semibold text-gray-900">
                    AI Analysis
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {getCategoryIcon(ticket.ai_analysis.category)}
                    </span>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">
                      {ticket.ai_analysis.category.replace('_', ' ')}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      (
                      {Math.round(ticket.ai_analysis.category_confidence * 100)}
                      %)
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2">
                      {getSentimentIcon(ticket.ai_analysis.sentiment)}
                    </span>
                    <span className="text-gray-600">Sentiment:</span>
                    <span className="ml-2 font-medium">
                      {ticket.ai_analysis.sentiment}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      (
                      {Math.round(
                        ticket.ai_analysis.sentiment_confidence * 100
                      )}
                      %)
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Processed in {ticket.ai_analysis.processing_time_ms}ms •
                  Language: {ticket.ai_analysis.detected_language}
                </div>
              </div>
            )}

            {/* Tags */}
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {ticket.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div>
                Created by{' '}
                <span className="font-medium">{ticket.reporter_id}</span>
              </div>
              <div>{formatDate(ticket.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

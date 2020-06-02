class ApplicationController < ActionController::Base
  protect_from_forgery

  rescue_from DoubleLoginException do |_e|
    redirect_to root_path,
                alert: 'You are currently logged into another session.'
  end

  module Bottlenose
    # Error calling Bottlenose API.
    class ApiError < RuntimeError
      def initialize
        super 'Bottlenose API error. Please report to a professor or site admin.'
      end
    end

    # Connection to Bottlenose failed.
    class ConnectionFailed < RuntimeError
      def initialize
        super 'Error contacting Bottlenose. Please report to a professor or site admin.'
      end
    end
  end

  def bottlenose_get(*args)
    bottlenose_token.get(*args).parsed
  rescue OAuth2::Error
    raise Bottlenose::ApiError
  rescue Faraday::ConnectionFailed
    raise Bottlenose::ConnectionFailed
  end

  def bottlenose_token
    @bottlenose_token ||=
      if current_user
        OAuth2::AccessToken.new(
          bottlenose_oauth_client, current_user.bottlenose_access_token
        )
      end
  end

  private

  def bottlenose_oauth_client
    @bottlenose_oauth_client ||= OAuth2::Client.new(
      ENV.fetch('BOTTLENOSE_APP_ID'),
      ENV.fetch('BOTTLENOSE_APP_SECRET'),
      site: ENV.fetch('BOTTLENOSE_URL')
    )
  end
end

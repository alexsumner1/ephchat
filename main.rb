require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/basic_auth'
require 'json'


set :port, 80
set :bind, '0.0.0.0'

messages = []
lastSent = 0
wiped = 0
expiry = 8



authorize do |username, password|
  username == "user" && password == File.open("password.txt", "rb").read.to_s.chomp
end

protect do

    get '/' do
    erb :main
    end

    post '/message' do
      lastSent = Time.now.to_i
      if messages.size >= expiry
        while messages.size >= expiry
          messages.shift
        end
      end
      content_type :json
      request.body.rewind
      message = JSON.parse(request.body.read.to_s)
      #message.to_json
      messages.push({ "username" => message['username'].to_s, "item" => message['message'].to_s, "timestamp" => lastSent })
      messages.to_json
    end

    get '/message' do
      content_type :json
      messages.to_json
    end

    get '/update' do
      ts = params['timestamp'].to_i
      if ts < lastSent
        content_type :json
        messages.to_json
      else
        status 304
      end
    end

    get '/expiry' do
      content_type :json
      expiry.to_json
    end

    post '/expiry' do
      expiry = params['s'].to_i
      content_type :json
      expiry.to_json
    end

end

get '/wipe' do
  wiped = 1
  lastSent = lastSent + 5
  messages = [{"username" => "SYSTEM", "item" => "Conversation Cleared", "timestamp" => lastSent }]
  content_type :json
  messages.to_json
end

get '/shutdown' do
  messages.each {|message|
    message['message'] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    message['username'] = "aaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }

  messages = [{"username" => "SYSTEM", "item" => "EMERGENCY SHUTDOWN INITIATED"}]
  content_type :json
  messages.to_json
  Process.kill('TERM', Process.pid)
end


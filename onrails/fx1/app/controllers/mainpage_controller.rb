class MainpageController < ApplicationController
	def index
		@versions = XamppVersion.all(:order => 'xampp_version desc')
	end
end

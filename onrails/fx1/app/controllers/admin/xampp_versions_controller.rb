class Admin::XamppVersionsController < ApplicationController
  layout 'admin'
  before_action :set_admin_xampp_version, only: [:show, :edit, :update, :destroy]

  # GET /admin/xampp_versions
  # GET /admin/xampp_versions.json
  def index
    @admin_xampp_versions = Admin::XamppVersion.all
  end

  # GET /admin/xampp_versions/1
  # GET /admin/xampp_versions/1.json
  def show
  end

  # GET /admin/xampp_versions/new
  def new
    @admin_xampp_version = Admin::XamppVersion.new
  end

  # GET /admin/xampp_versions/1/edit
  def edit
  end

  # POST /admin/xampp_versions
  # POST /admin/xampp_versions.json
  def create
    @admin_xampp_version = Admin::XamppVersion.new(admin_xampp_version_params)

    respond_to do |format|
      if @admin_xampp_version.save
        if !rewrite_links(@admin_xampp_version.id)
          @errors = @archive_links_errors
          format.js {render action: 'create'}
          format.html { render action: 'edit' }
          format.json { render json: @admin_xampp_version.errors, status: :unprocessable_entity }
        end
        format.js { render action: 'create' }
        format.html { redirect_to @admin_xampp_version, notice: 'Xampp version was successfully created.' }
        format.json { render action: 'show', status: :created, location: @admin_xampp_version }
      else
        @errors = @admin_xampp_version.errors
        format.js {render action: 'create'}
        format.html { render action: 'new' }
        format.json { render json: @admin_xampp_version.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /admin/xampp_versions/1
  # PATCH/PUT /admin/xampp_versions/1.json
  def update
    respond_to do |format|
      if @admin_xampp_version.update(admin_xampp_version_params)
        if !rewrite_links(@admin_xampp_version.id)
          @errors = @archive_links_errors
          format.js {render action: 'update'}
          format.html { render action: 'edit' }
          format.json { render json: @admin_xampp_version.errors, status: :unprocessable_entity }
        end
        format.js { render action: 'update' }
        format.html { redirect_to @admin_xampp_version, notice: 'Xampp version was successfully updated.' }
        format.json { head :no_content }
      else
        @errors = @admin_xampp_version.errors
        format.js {render action: 'update'}
        format.html { render action: 'edit' }
        format.json { render json: @admin_xampp_version.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /admin/xampp_versions/1
  # DELETE /admin/xampp_versions/1.json
  def destroy
    @admin_xampp_version.destroy
    respond_to do |format|
      format.html { redirect_to admin_xampp_versions_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_admin_xampp_version
      @admin_xampp_version = Admin::XamppVersion.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def admin_xampp_version_params
      params.require(:admin_xampp_version).permit(:apache_version, :mysql_client_version, :mysql_server_version, :php_version, :xampp_version)
    end
    
    # Save xampp versions link
    def rewrite_links(xampp_version_id)
      Admin::ArchiveLink.delete_all("xampp_version_id = #{xampp_version_id}")
      links = params[:admin_archive_link][:alink]
      links.each do |index, l|
        link = Admin::ArchiveLink.new(l)
        link.xampp_version_id = xampp_version_id
        if !link.save
          @archive_links_errors = link.errors
          return false
        end
      end
      return true
    end
end

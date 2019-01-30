class Admin::ArchiveLinksController < ApplicationController
  layout 'admin'
  before_action :set_admin_archive_link, only: [:show, :edit, :update, :destroy]

  # GET /admin/archive_links
  # GET /admin/archive_links.json
  def index
    @admin_archive_links = Admin::ArchiveLink.all
  end

  # GET /admin/archive_links/1
  # GET /admin/archive_links/1.json
  def show
  end

  # GET /admin/archive_links/new
  def new
    @admin_archive_link = Admin::ArchiveLink.new
  end

  # GET /admin/archive_links/1/edit
  def edit
  end

  # POST /admin/archive_links
  # POST /admin/archive_links.json
  def create
    @admin_archive_link = Admin::ArchiveLink.new(admin_archive_link_params)

    respond_to do |format|
      if @admin_archive_link.save
        format.html { redirect_to @admin_archive_link, notice: 'Archive link was successfully created.' }
        format.json { render action: 'show', status: :created, location: @admin_archive_link }
      else
        format.html { render action: 'new' }
        format.json { render json: @admin_archive_link.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /admin/archive_links/1
  # PATCH/PUT /admin/archive_links/1.json
  def update
    respond_to do |format|
      if @admin_archive_link.update(admin_archive_link_params)
        format.html { redirect_to @admin_archive_link, notice: 'Archive link was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @admin_archive_link.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /admin/archive_links/1
  # DELETE /admin/archive_links/1.json
  def destroy
    @admin_archive_link.destroy
    respond_to do |format|
      format.html { redirect_to admin_archive_links_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_admin_archive_link
      @admin_archive_link = Admin::ArchiveLink.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def admin_archive_link_params
      params.require(:admin_archive_link).permit(:bits, :link_full, :link_light, :xampp_version_id)
    end
end
